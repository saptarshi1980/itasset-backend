import { getConnection } from "../db.js";
import crypto from "crypto";

import oracledb from "oracledb";
import jwt from "jsonwebtoken";

export async function login(empCode, hexPassword) {
  const conn = await getConnection();

  try {
    // Assign SQL to a variable
    const sql = `
      SELECT get_udc_fn(u.password) AS passwd,
             n.emp_name,
             n.desig
      FROM t_dcpy_user_login u
      JOIN t_dcpy_roles r ON u.role_id = r.role_id
      JOIN app_vw_emp n ON n.emp_id = u.login_name
      WHERE u.login_name = :empCode
        AND r.role_id = 21
    `;

    // Debug: print SQL with empCode substituted
    console.log("Executing query:", sql.replace(":empCode", `'${empCode}'`));

    // Execute query
    const result = await conn.execute(sql, { empCode }, { outFormat: oracledb.OUT_FORMAT_OBJECT });


    if (result.rows.length === 0) {
      return {
        EMP_CODE: empCode,
        EMP_NAME: "Invalid Employee Code",
        DESIGNATION: "N/A",
        SUCCESS: 0
      };
    }

    const row = result.rows[0];
    const dbPassword = row.PASSWD; // password from DB
    const dbHex = crypto.createHash("sha256").update(dbPassword).digest("hex");

    // Debug: print passwords
    console.log("Password from DB:", dbPassword);
    console.log("DB password hex:", dbHex);
    console.log("Frontend hex password:", hexPassword);

    // if (dbHex === hexPassword) {
    //   return {
    //     EMP_CODE: empCode,
    //     EMP_NAME: row.EMP_NAME,
    //     DESIGNATION: row.DESIG,
    //     SUCCESS: 1
    //   };
    // }
    if (dbHex === hexPassword) {

  const token = jwt.sign(
    {
      empCode: empCode,
      empName: row.EMP_NAME,
      role: "IT_ADMIN"
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    token,
    EMP_CODE: empCode,
    EMP_NAME: row.EMP_NAME,
    DESIGNATION: row.DESIG,
    SUCCESS: 1
  };
}

    
    else {
      return {
        EMP_CODE: empCode,
        EMP_NAME: "Invalid Employee Code",
        DESIGNATION: "N/A",
        SUCCESS: 0
      };
    }
  } finally {
    await conn.close();
  }
}
