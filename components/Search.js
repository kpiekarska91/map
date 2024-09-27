import {fromLonLat} from 'ol/proj.js';

export default class Search {
    constructor(mapInstance) {
        this.map = mapInstance;
        this.searchInput = document.getElementById('handle-query');
        this.formSearch = document.getElementById('handle-search');
        this.form = document.getElementById('search-form');
        this.initSearchInput();
        this.initSearchFormAndClickOut();
        this.initSearchFormSubmission();
    }

    initSearchInput() {
        this.searchInput.addEventListener('input', () => {
            const query = this.searchInput.value;
            query.trim().length >= 4 ? this.searchPlace(query) : this.updateSearchResults([]);
        });
    }

    initSearchFormAndClickOut() {
        document.addEventListener('click', (event) => {
            const resultsList = document.getElementById('results-list');
            if (event.target !== resultsList && !resultsList.contains(event.target)) {
                this.updateSearchResults([]); // Closing list
            }
        });
        this.formSearch.addEventListener("click", () => this.searchPlace(this.searchInput.value, 1));
    }

    initSearchFormSubmission() {
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.searchPlace(this.searchInput.value, 1);
        });
    }

    updateSearchResults(results, limit = 10) {
        const resultList = document.getElementById('results-list');
        resultList.innerHTML = '';
        const createListItem = (result) => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.textContent = result.display_name;
            listItem.addEventListener('click', () => {
                this.handleResultClick(result);
                this.updateSearchResults([]); // Closing list after click
            });
            return listItem;
        };
        if (limit == 1) {
            if (results[0]) {
                this.handleResultClick(results[0]);
                this.updateSearchResults([]);
            }
        } else {
            results.forEach(result => {
                resultList.appendChild(createListItem(result));
            });
        }
    }

    handleResultClick(result) {
        const coordinates = [parseFloat(result.lon), parseFloat(result.lat)];
        this.map.getView().animate({center: fromLonLat(coordinates), zoom: 15});
    }


    searchPlace(query, limit = 10) {
        const searchData = {
            format: 'json',
            addressdetails: 1,
            q: query,
            limit: limit,
        };

        const searchQueryString = Object.keys(searchData)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(searchData[key])}`)
            .join('&');

        fetch(`https://nominatim.openstreetmap.org?${searchQueryString}`, {method: 'GET'})
            .then(response => response.json())
            .then(results => {
                this.updateSearchResults(results, limit);
            })
            .catch(error => {
                console.error('Error:', error);
                this.updateSearchResults([]);
            });
    }
}
