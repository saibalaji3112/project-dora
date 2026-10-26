"""Gemini-first text generation with OpenRouter as a configured fallback."""

import json
import os
from types import SimpleNamespace
import httpx
from dotenv import load_dotenv
from google import genai
from google.genai import errors, types

load_dotenv()

GEMINI_MODELS = (
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash",
)
_gemini_clients = {}
_openrouter_client = httpx.Client(
    headers={"X-Title": "Project Dora"},
    timeout=httpx.Timeout(45.0, connect=8.0),
    limits=httpx.Limits(max_connections=10, max_keepalive_connections=5),
)


class LLMProviderError(RuntimeError):
    """A safe-to-display provider failure; never contains credentials."""

    def __init__(self, message, status_code=502):
        super().__init__(message)
        self.status_code = status_code


def _gemini_client(timeout_ms=60_000):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise LLMProviderError("Set OPENROUTER_API_KEY or GEMINI_API_KEY in backend/.env.")
    client = _gemini_clients.get(timeout_ms)
    if client is None:
        client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(
                timeout=timeout_ms,
                retry_options=types.HttpRetryOptions(attempts=1),
            ),
        )
        _gemini_clients[timeout_ms] = client
    return client


def _status_code(exc):
    return getattr(exc, "code", getattr(exc, "status_code", None))


def _make_response(text, finish_reason="STOP"):
    part = SimpleNamespace(text=text)
    content = SimpleNamespace(parts=[part])
    candidate = SimpleNamespace(finish_reason=finish_reason, content=content)
    return SimpleNamespace(text=text, candidates=[candidate])


def _generate_with_openrouter(prompt, *, timeout_ms, response_mime_type=None, max_tokens=None):
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    model = os.getenv("OPENROUTER_MODEL", "openrouter/free").strip()
    body = {
        "model": model,
        "max_tokens": max_tokens or int(os.getenv("OPENROUTER_MAX_TOKENS", "2200")),
        "messages": [{"role": "user", "content": prompt}],
    }
    if response_mime_type == "application/json":
        body["response_format"] = {"type": "json_object"}

    try:
        for attempt in range(2):
            response = _openrouter_client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json=body,
                headers={"Authorization": f"Bearer {api_key}"},
                timeout=max(timeout_ms / 1000, 1),
            )
            response.raise_for_status()
            payload = response.json()
            choices = payload.get("choices")
            choice = choices[0] if isinstance(choices, list) and choices and isinstance(choices[0], dict) else {}
            reason = choice.get("finish_reason") or "stop"
            if reason == "length":
                raise LLMProviderError("The free model response was cut short. Try the search again.", status_code=503)
            message = choice.get("message") or {}
            content = message.get("content") if isinstance(message, dict) else None
            if isinstance(content, list):
                parts = []
                for part in content:
                    if isinstance(part, str):
                        parts.append(part)
                    elif isinstance(part, dict):
                        parts.append(part.get("text") or part.get("content") or "")
                content = "".join(parts)
            if not isinstance(content, str) or not content.strip():
                content = choice.get("text") if isinstance(choice, dict) else None
            if isinstance(content, str) and content.strip():
                finish_reason = "STOP" if reason == "stop" else str(reason).upper()
                return _make_response(content.strip(), finish_reason)
            model_used = payload.get("model", model)
            message_fields = sorted(message.keys()) if isinstance(message, dict) else []
            print(f"OpenRouter returned no final text (model={model_used}, finish={reason}, message_fields={message_fields}, attempt={attempt + 1}).")
        raise LLMProviderError(
            "OpenRouter's free model returned no final answer after a retry. Try again, or choose a specific free model in backend/.env.",
            status_code=503,
        )
    except httpx.HTTPStatusError as exc:
        status = exc.response.status_code
        if status in (401, 403):
            message = "OpenRouter rejected OPENROUTER_API_KEY. Check that the key is active and copied completely."
        elif status == 402:
            message = "OpenRouter could not fulfill this request. Check the selected model and your account limits."
        elif status == 429:
            message = "The OpenRouter free-model limit was reached. Wait and try again."
        elif status >= 500:
            message = "OpenRouter is temporarily unavailable. Please try again shortly."
        else:
            message = f"OpenRouter rejected the request (HTTP {status}). Check the model setting and retry."
        raise LLMProviderError(message, status_code=503 if status in (402, 429) or status >= 500 else 502) from exc
    except (httpx.TransportError, TimeoutError, OSError, json.JSONDecodeError) as exc:
        raise LLMProviderError(
            "Could not reach OpenRouter. Check the backend connection and try again.",
            status_code=503,
        ) from exc


def generate_text(
    prompt,
    *,
    model_names=GEMINI_MODELS,
    timeout_ms=60_000,
    thinking_level=None,
    response_mime_type=None,
    max_tokens=None,
):
    """Try Gemini first, then fall back to OpenRouter when configured."""
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    if gemini_key:
        try:
            return _generate_with_gemini(
                prompt,
                model_names=model_names,
                timeout_ms=timeout_ms,
                thinking_level=thinking_level,
                response_mime_type=response_mime_type,
                max_tokens=max_tokens,
            )
        except (LLMProviderError, errors.ServerError, errors.ClientError, httpx.TransportError, TimeoutError) as exc:
            if not openrouter_key:
                raise
            print(f"Gemini unavailable ({type(exc).__name__}); trying the configured OpenRouter fallback.")
    elif not openrouter_key:
        raise LLMProviderError("Set GEMINI_API_KEY or OPENROUTER_API_KEY in backend/.env.")
    else:
        print("GEMINI_API_KEY is not configured; using the OpenRouter fallback.")

    if openrouter_key:
        print(f"Trying OpenRouter model: {os.getenv('OPENROUTER_MODEL', 'openrouter/free')}")
        return _generate_with_openrouter(
            prompt,
            timeout_ms=timeout_ms,
            response_mime_type=response_mime_type,
            max_tokens=max_tokens,
        )

    raise LLMProviderError("Gemini could not complete the request and no OpenRouter fallback is configured.", status_code=503)


def _generate_with_gemini(
    prompt,
    *,
    model_names,
    timeout_ms,
    thinking_level=None,
    response_mime_type=None,
    max_tokens=None,
):
    client = _gemini_client(timeout_ms)
    last_transient_error = None
    config_values = {}
    if thinking_level:
        config_values["thinking_config"] = types.ThinkingConfig(thinking_level=thinking_level)
    if response_mime_type:
        config_values["response_mime_type"] = response_mime_type
    if max_tokens:
        config_values["max_output_tokens"] = max_tokens
    config = types.GenerateContentConfig(**config_values) if config_values else None

    for model_name in model_names:
        try:
            print(f"Trying Gemini model: {model_name}")
            request = {"model": model_name, "contents": prompt}
            if config is not None:
                request["config"] = config
            response = client.models.generate_content(**request)
            if not getattr(response, "text", None):
                raise LLMProviderError("Gemini returned an empty response.")
            return response
        except (errors.ServerError, errors.ClientError, httpx.TransportError, TimeoutError) as exc:
            status = _status_code(exc)
            if status == 404:
                continue
            if status == 429 or status in (500, 502, 503, 504) or isinstance(exc, (httpx.TransportError, TimeoutError)):
                last_transient_error = exc
                break
            raise

    if last_transient_error is not None:
        status = _status_code(last_transient_error)
        if status == 429:
            raise LLMProviderError(
                "Gemini's request limit was reached. Wait for the quota to reset, then try again.",
                status_code=503,
            ) from last_transient_error
        raise LLMProviderError(
            "Gemini is temporarily unavailable. Please try again shortly.",
            status_code=503,
        ) from last_transient_error

    raise LLMProviderError("No configured Gemini model is available.")





