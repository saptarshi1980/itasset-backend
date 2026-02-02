// 



import { getConnection } from "../db.js";

async function allocateAsset(assetNo, empCode, remarks) {
  const conn = await getConnection();
  try {
    await conn.execute(
      `BEGIN
         ITA_ALLOCATE_ASSET(
           p_asset_no => :assetNo,
           p_emp_code => :empCode,
           p_remarks  => :remarks
         );
       END;`,
      { assetNo, empCode, remarks },
      { autoCommit: true }
    );
  } finally {
    await conn.close();
  }
}

async function returnAsset(assetNo, remarks) {
  const conn = await getConnection();
  try {
    await conn.execute(
      `BEGIN
         ITA_RETURN_ASSET(
           p_asset_no => :assetNo,
           p_remarks  => :remarks
         );
       END;`,
      { assetNo, remarks },
      { autoCommit: true }
    );
  } finally {
    await conn.close();
  }
}

export async function getAssetByAssetNo(assetNo) {
  const conn = await getConnection();
  try {
    const result = await conn.execute(
      `
      SELECT *
      FROM ITA_ASSET_TXN t
      WHERE UPPER(t.ASSET_NO) = UPPER(:assetNo)
        AND t.TXN_TYPE = 'ALLOCATE'
        AND NOT EXISTS (
          SELECT 1 FROM ITA_ASSET_TXN r
          WHERE r.ASSET_NO = t.ASSET_NO
            AND r.TXN_TYPE = 'RETURN'
            AND r.TXN_DATE > t.TXN_DATE
        )
      `,
      { assetNo },
      { outFormat: 4002 } // OBJECT
    );

    if (result.rows.length === 0) {
      throw new Error("Asset not currently allocated");
    }

    return result.rows[0];
  } finally {
    await conn.close();
  }
}

/* -------- Get assets by Employee -------- */
export async function getAssetsByEmployee(empCode) {
  const conn = await getConnection();
  try {
    const result = await conn.execute(
      `
      SELECT *
      FROM ITA_ASSET_TXN t
      WHERE t.EMP_CODE = :empCode
        AND t.TXN_TYPE = 'ALLOCATE'
        AND NOT EXISTS (
          SELECT 1 FROM ITA_ASSET_TXN r
          WHERE r.ASSET_NO = t.ASSET_NO
            AND r.TXN_TYPE = 'RETURN'
            AND r.TXN_DATE > t.TXN_DATE
        )
      `,
      { empCode },
      { outFormat: 4002 }
    );

    return result.rows;
  } finally {
    await conn.close();
  }
}

export async function createAsset(asset) {
  const conn = await getConnection();
  try {
    await conn.execute(
  `
  INSERT INTO ITA_ASSET_MASTER
  (ASSET_NO, ASSET_TYPE, MODEL, SERIAL_NO, STATUS, CREATED_DATE)
  VALUES (:assetNo, :assetType, :model, :serialNo, :status, SYSDATE)
  `,
  {
    assetNo: asset.assetNo.toUpperCase(),
    assetType: asset.assetType,
    model: asset.model,
    serialNo: asset.serialNo,
    status: asset.status
  },
  { autoCommit: true }
);

  } finally {
    await conn.close();
  }
}

/* ---------- Update Asset ---------- */
export async function updateAsset(assetNo, asset) {
  const conn = await getConnection();
  try {
    await conn.execute(
  `
  UPDATE ITA_ASSET_MASTER
  SET ASSET_TYPE = :assetType,
      MODEL = :model,
      SERIAL_NO = :serialNo,
      STATUS = :status
  WHERE ASSET_NO = :assetNo
  `,
  {
    assetNo: assetNo.toUpperCase(),
    assetType: asset.assetType,
    model: asset.model,
    serialNo: asset.serialNo,
    status: asset.status
  },
  { autoCommit: true }
);

  } finally {
    await conn.close();
  }
}

/* ---------- List Assets ---------- */
export async function listAssets() {
  const conn = await getConnection();
  try {
    const result = await conn.execute(
      `
      SELECT
        ASSET_NO     AS "assetNo",
        ASSET_TYPE   AS "assetType",
        MODEL        AS "model",
        SERIAL_NO    AS "serialNo",
        STATUS       AS "status",
        CREATED_DATE AS "createdDate"
      FROM ITA_ASSET_MASTER
      ORDER BY ASSET_NO
      `,
      [],
      { outFormat: 4002 } // OBJECT
    );

    return result.rows; // ALWAYS an array
  } finally {
    await conn.close();
  }
}

export default {
  allocateAsset,
  returnAsset,
  getAssetByAssetNo,
  getAssetsByEmployee,
  createAsset,
  updateAsset,
  listAssets
};

