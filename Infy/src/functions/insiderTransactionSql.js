const createTable = `
  CREATE TABLE IF NOT EXISTS insider_transactions (
    id SERIAL PRIMARY KEY,
    change INT,
    currency TEXT,
    filingDate DATE,
    name TEXT,
    share INT,
    symbol TEXT,
    transactionDate DATE,
    transactionPrice NUMERIC
  );
`;

const insertQueryAndValues = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return; 
  }

  const columns = [
      'change', 
      'currency', 
      'filingDate', 
      'name', 
      'share', 
      'symbol', 
      'transactionDate', 
      'transactionPrice',
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
    INSERT INTO insider_transactions (${columns.join(', ')})
    VALUES ${valueRows.join(', ')}
    RETURNING id
  `;

  return { insertQuery, allValues }

};

module.exports = { createTable, insertQueryAndValues };
