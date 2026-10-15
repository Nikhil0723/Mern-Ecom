const ADDRESS_STORAGE_KEY = "savedAddress";

export const getSavedAddress = () => {
  try {
    const data = localStorage.getItem(ADDRESS_STORAGE_KEY);

    return data ? JSON.parse(data) : null;
  } catch {
    localStorage.removeItem(ADDRESS_STORAGE_KEY);
    return null;
  }
};

export const saveAddress = (address) => {
  localStorage.setItem(
    ADDRESS_STORAGE_KEY,
    JSON.stringify(address)
  );
};

export const removeSavedAddress = () => {
  localStorage.removeItem(ADDRESS_STORAGE_KEY);
};