import { getItems, getStructures } from '@antv/infographic';
import { render, RenderOptions } from './renderer';

const STORAGE_KEY = 'infographic-options';

function loadOptionsFromStorage(): RenderOptions {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load options from localStorage:', error);
  }
  return {
    structure: 'list-column',
    item: 'pyramid',
  };
}

function saveOptionsToStorage(options: RenderOptions): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
}

const options: RenderOptions = loadOptionsFromStorage();

function createOption(value: string): HTMLOptionElement {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = value;
  return option;
}

function populateSelect(
  selectElement: HTMLSelectElement,
  items: string[],
): void {
  const fragment = document.createDocumentFragment();
  items.forEach((item) => fragment.appendChild(createOption(item)));
  selectElement.appendChild(fragment);
}

function setupSelect(
  selectId: string,
  items: string[],
  defaultValue: string,
  onChange: (value: string) => void,
): HTMLSelectElement | null {
  const selectElement = document.getElementById(selectId) as HTMLSelectElement;

  if (!selectElement) {
    console.error(`Select element with id "${selectId}" not found`);
    return null;
  }

  try {
    populateSelect(selectElement, items);
    selectElement.value = defaultValue;

    selectElement.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement;
      onChange(target.value);
    });

    return selectElement;
  } catch (error) {
    console.error(`Failed to setup select "${selectId}":`, error);
    return null;
  }
}

function renderInfographic(): void {
  try {
    render(options);
    saveOptionsToStorage(options);
  } catch (error) {
    console.error('Failed to render infographic:', error);
  }
}

function init(): void {
  setupSelect(
    'structure-select',
    getStructures(),
    options.structure,
    (value) => {
      options.structure = value;
      renderInfographic();
    },
  );

  setupSelect('item-select', getItems(), options.item, (value) => {
    options.item = value;
    renderInfographic();
  });

  const backgroundValue = options.background === '#333' ? 'dark' : 'light';
  setupSelect(
    'background-select',
    ['light', 'dark'],
    backgroundValue,
    (value) => {
      options.background = value === 'dark' ? '#333' : '#fff';
      renderInfographic();
    },
  );

  renderInfographic();
}

init();
