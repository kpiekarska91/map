import Map from "./components/Map";

const brands = ['bosman', 'piast', 'harnas'];
const brand = window.location.hostname.split('.')[0].toLowerCase();
const chosenBrand = !brands.includes(brand) ? 'bosman' : brand;

document.body.classList.add(chosenBrand);
document.body.classList.add('configured');

const map = new Map(chosenBrand);
