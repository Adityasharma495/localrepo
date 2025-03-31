function formatResponseIds(data, version = '1') {
    if (version !== '2') return data;
  
    const transform = (item) => {
      if (item && item.id !== undefined) {
        const { id, ...rest } = item;
        return { _id: id, ...rest };
      }
      return item;
    };
  
    if (Array.isArray(data)) {
      return data.map(transform);
    }
  
    return transform(data);
  }
  
  module.exports = { formatResponseIds };