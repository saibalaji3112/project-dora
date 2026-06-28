const SearchBar = ({ placeholder = "Search..." }) => {
  return (
    <div className="search-bar">
      <input type="text" placeholder={placeholder} />
    </div>
  );
};

export default SearchBar;
