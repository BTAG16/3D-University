import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import './SearchBox.css'

function SearchBox({ value, onChange, placeholder = 'Search buildings...' }) {
  return (
    <div className="search-box">
      <FontAwesomeIcon icon={faSearch} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
    </div>
  )
}

export default SearchBox
