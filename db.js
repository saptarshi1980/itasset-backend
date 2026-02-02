import oracledb from "oracledb";

export async function initPool() {
  await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
  });
}

export async function getConnection() {
  return await oracledb.getConnection();
}
