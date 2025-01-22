const createTable = `
  CREATE TABLE IF NOT EXISTS recommend_data (
    id SERIAL PRIMARY KEY,
    buy INT,
    hold INT,
    period DATE,
    sell INT,
    strongBuy INT,
    strongSell INT,
    symbol TEXT
  );
`;

const insertQueryAndValues = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return; 
  }

  const columns = [
    'buy',
    'hold',
    'period',
    'sell',
    'strongBuy',
    'strongSell',
    'symbol' 
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
    INSERT INTO recommend_data (${columns.join(', ')})
    VALUES ${valueRows.join(', ')}
    RETURNING id
  `;

  return { insertQuery, allValues }
};

module.exports = { createTable, insertQueryAndValues };
