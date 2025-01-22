const createTable = `
    CREATE TABLE IF NOT EXISTS company_profile (
        id SERIAL PRIMARY KEY,
        symbol TEXT,
        country TEXT,
        currency TEXT,
        estimateCurrency TEXT,
        exchange TEXT,
        finnhubIndustry TEXT,
        ipo DATE,
        logo TEXT,
        marketCapitalization NUMERIC,
        name TEXT,
        phone TEXT,
        shareOutstanding NUMERIC,
        ticker TEXT,
        weburl TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );
`;

const insertQuery = `
    INSERT INTO company_profile
        (symbol, country, currency, estimateCurrency, exchange, finnhubIndustry,
         ipo, logo, marketCapitalization, name, phone, shareOutstanding, ticker, weburl)
    VALUES
        ($1, $2, $3, $4, $5, $6,
         TO_DATE($7, 'YYYY-MM-DD'), $8, $9, $10, $11, $12, $13, $14)
    RETURNING id;
`;

const setCompanyInsertValues = (symbol, companyProfile) => {
    return [
        symbol,
        companyProfile.country || null,
        companyProfile.currency || null,
        companyProfile.estimateCurrency || null,
        companyProfile.exchange || null,
        companyProfile.finnhubIndustry || null,
        companyProfile.ipo,
        companyProfile.logo || null,
        companyProfile.marketCapitalization || null,
        companyProfile.name || null,
        companyProfile.phone || null,
        companyProfile.shareOutstanding || null,
        companyProfile.ticker || null,
        companyProfile.weburl || null
    ];
};

module.exports = { createTable, insertQuery, setCompanyInsertValues }; 