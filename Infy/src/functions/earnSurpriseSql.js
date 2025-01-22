const createTable = `
  CREATE TABLE IF NOT EXISTS earn_surprise (
    id SERIAL PRIMARY KEY,
    actual NUMERIC,
    estimate NUMERIC,
    period DATE,
    quarter INT,
    surprise NUMERIC,
    surprisePercent NUMERIC,
    symbol TEXT,
    year INT
  );
`;

const insertQueryAndValues = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return; 
  }

  const columns = [
    'actual',
    'estimate',
    'period',
    'quarter',
    'surprise',
    'surprisePercent',
    'symbol',
    'year'
  ];

  let i = 1;
  const valueRows = [];
  const allValues = [];

  for (const row of data) {
    const placeHolders = [];
    for (const col of columns) {
      placeHolders.push(`$${i++}`);
      allValues.push(row[col] ?? null)
    }

    valueRows.push(`(${placeHolders.join(',')})`);
  }

  const insertQuery =`
    INSERT INTO earn_surprise (${columns.join(', ')})
    VALUES ${valueRows.join(', ')}
    RETURNING id
  `;

  return { insertQuery, allValues }
};

module.exports = { createTable, insertQueryAndValues };
