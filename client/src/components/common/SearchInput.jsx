
import { SearchIcon } from './Icons';
import './common.css';

export const SearchInput = ({ placeholder = "Nhập từ khoá tìm kiếm...", value, onChange, onSubmit }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <div className="search-container">
      <SearchIcon size={18} className="search-icon" />
      <input 
        type="text" 
        className="search-input" 
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
