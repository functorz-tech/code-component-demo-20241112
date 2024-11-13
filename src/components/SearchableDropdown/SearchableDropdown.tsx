import { useState, useEffect, useCallback } from 'react';
import citySearchQuery from '@/graphql/citySearchQuery.gql';
import { State, useAppContext } from 'zvm-code-context';
import debounce from 'lodash/debounce';
import './SearchableDropdown.css';

export interface SearchableDropdownPropData {

}

export interface SearchableDropdownStateData {
  selectedCity?: State<string>;
}

export interface SearchableDropdownEvent {
}

export interface SearchableDropdownProps {
  propData: SearchableDropdownPropData;
  propState: SearchableDropdownStateData;
  event: SearchableDropdownEvent;
}

export function SearchableDropdown({ propState }: SearchableDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { query } = useAppContext();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchValue: string) => {
      setIsLoading(true);
      try {
        const variables = {
          where: searchValue 
            ? { 
                city_name: { 
                  _ilike: `%${searchValue}%` 
                } 
              }
            : {},
          distinct_on: ['city_name']
        };

        const result = await query(citySearchQuery.loc.source.body, variables);
        const cityList = result.data.sales_history.map((item: any) => item.city_name);
        setCities(cityList);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [query]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    
    // Cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  return (
    <div className={`searchable-dropdown ${isExpanded ? 'expanded' : ''}`}>
      <div className="input-wrapper">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={() => setIsExpanded(!isExpanded)}
          placeholder="Search cities..."
          className="searchable-dropdown-input"
        />
        {searchTerm && (
          <button 
            className="clear-button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent input's onClick from firing
              setSearchTerm('');
              propState.selectedCity?.set('');
            }}
          >
            ×
          </button>
        )}
      </div>
      <div className="dropdown-list">
        {isLoading ? (
          <div className="loading-message">Loading...</div>
        ) : cities.length > 0 ? (
          cities.map((city) => (
            <div
              key={city}
              onClick={() => {
                propState.selectedCity?.set(city);
                setSearchTerm(city);
                setIsExpanded(false);
              }}
              className="city-option"
            >
              {city}
            </div>
          ))
        ) : (
          <div className="no-results-message">No cities found</div>
        )}
      </div>
    </div>
  );
}
