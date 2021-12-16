const mysql = require('mysql');
const axios = require('axios');

const con = mysql.createConnection({
   host: "34.70.110.91",
   user: "root",
   password: "tHxnIuqEnbPIs9F6",
   database: "lk-sea"
});

con.connect(function (err) {
   if (err) throw err;
   console.log("Connected!");

   let sql = "SELECT vn_ward.id as id, vn_ward.postalcode as postalcode, vn_ward._name as ward, vn_ward._prefix as w_prefix, vn_district._name as district, vn_district._prefix as d_prefix, vn_province._name as province, vn_province.english_name as eng FROM vn_ward INNER JOIN vn_district ON vn_ward._district_id=vn_district.id INNER JOIN vn_province ON vn_ward._province_id=vn_province.id WHERE vn_ward.postalcode IS NULL";
   con.query(sql, async function (err, result) {
      if (err) throw err;

      console.log("Result: ", result.length);
      for (let i = 0; i < result.length; i++) {
         let string = result[i].w_prefix + " " + result[i].ward + ", " + result[i].d_prefix + " " + result[i].district + ", " + result[i].province 
         console.log(result[i].id);
         console.log(string);
         if (result[i].postalcode == null){
            let address = encodeURIComponent(string);
            let apiKey = '1aac351f491be75612da6f95323210be44a7ba1a841fe045'
            let url = `https://maps.vnpost.vn/api/search?text=${address}&apikey=${apiKey}&api-version=1.1`
            let { data } = await axios.get(url)

            let sql2 = ''
            if (data.data.features?.[0]?.properties?.postcode){
               let postcode = data.data.features[0].properties.postcode
               sql2 = `UPDATE vn_ward SET postalcode = '${postcode}' WHERE id = ${result[i].id}`
               console.log(postcode);
            } else {
               sql2 = `UPDATE vn_ward SET postalcode = 999999 WHERE id = ${result[i].id}`
            }

            con.query(sql2, async function (err, result) {
               if (err) throw err;
               console.log("Result: ", result);
            })
         }
         await new Promise(resolve => setTimeout(resolve, 650));
      }
   });
}); 