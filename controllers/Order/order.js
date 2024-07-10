const { db } = require("../../config/admin");
var express = require('express')
const moment = require("moment");
const json2xls = require('json2xls');
const app = express()
var path = require('path');
var mime = require('mime');
const fs = require('fs');
const ExcelJS = require('exceljs');
// var bodyParser = require('body-parser')
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended:false}))

// Get all orders controller
exports.listOrders = async (req, res) => {
  try {
    const orders = [];
    const data = await db.collection("order_details").get();
    data.forEach((doc) => {
      const order = { id: doc.id, orderData: doc.data() };
      orders.push(order);
    });
    return res.render("Order/displayOrders", {
      orders: orders,
    });
  } catch (error) {
    const errors = [];
    errors.push(error.message);
    return res.render("Order/displayOrders", {
      errors: errors,
    });
  }
};

/* Post request for export Data */
// exports.filterOrder = async (req, res) => {

//   const date = req.body;
//   let DD = [];
  
//   var st = new Date(date.start);
//   var e = new Date(date.end);
//   let transporter, driver, customer, order, vehicle;
//   // const startDate = moment(st, "YYYY-MM-DD").format("DD-MM-YYYY")+ " 00:00:00";
//   // const endDate = moment(e, "YYYY-MM-DD").format("DD-MM-YYYY")+ " 23:59:59";

//   try {  
//     const data = await db.collection("order_details")
//     .where("created_at",">=",st)
//     .where("created_at","<=",e)
//     .get();
//     data.forEach(async(doc) => {
//       let fd = doc.data().created_at.toDate();
//       let filterdata = moment(fd).format("DD-MM-YYYY");
//       // console.log(typeof filterdata,"filterData")
//       // console.log(typeof startDate,"startDate")
//       // if(filterdata >= startDate && filterdata <= endDate){
//       //   // console.log(typeof filterdata,"checkon")
//       // }
//       const order = { 
//         id: doc.id, 
//         orderData: doc.data() 
//       };
//       DD.push(order);
//     });
//     // DD.push(orders)
//     // console.log(DD,"filter order")
//     // for(let i = 0; i<DD.length;i++){
//     //   oId.push(DD[i])
//     // }
//     console.log(DD.length,"??????????????????All ID ???????")
//     return res.render("Order/displayOrders", {
//       orders: DD,
//     });
//   } catch (error) {
//     const errors = [];
//     errors.push(error.message);
//     return res.render("Order/displayOrders", {
//       errors: errors,
//     });
//   }
// };


exports.filterOrder = async (req, res) => {
  const date = req.body;
    console.log(date,"date backend")
    const startDate = moment(date.start, "YYYY-MM-DD").format("DD-MM-YYYY");
    const endDate = moment(date.end, "YYYY-MM-DD").format("DD-MM-YYYY");
    // if(date.start == "" || date.end == "" || (date.start > date.end)){
      if(date.start == "" || date.end == ""){
      // req.flash("error_msg", "Please Check date!");
      // return res.redirect("/order/list");
      const errors = "Please Check Date!"
      return res.status(400).send( errors);
      // return res.status(400).send({
      //   data: {},
      //   message: "Please Check Date!"
      // })
    }
    if(date.start > date.end){
      const errors = "Please Check "+"Start Date " + `${date.start}`+"And  End Date "+`${date.end}`
      // req.flash("error_msg", errors);
      // return res.redirect("/order/list");
      return res.status(400).send({ message: errors });
    }
    var st = new Date(date.start);
    var e = new Date(date.end);
    let transporter, driver, customer, order, vehicle;

    // if( st > new Date()){
    //   req.flash("error_msg", "Please Check date!");
    //   return res.redirect("/order/list");
      // return res.status(400).send({
      //   data: {},
      //   message: "Please Check Date!"
      // })
    // }
    
  
    try {  
      let DD = [];
      let STATUS = [];
      let TDATA = [];
      let PDATA = [];
      let DDATA = [];
      const data = await db.collection("order_details")
      .where("created_at",">=",st)
      .where("created_at","<=",e)
      .get();
      data.forEach(async(doc) => {
        let fd = doc.data().created_at.toDate();
        let filterdata = moment(fd).format("DD-MM-YYYY");
        // console.log(doc.data().status)
        const status = {
          id: doc.id,
          status:doc.data().status,
        }
        const tData = {
          id: doc.id,
          transporterData: doc.data().transporter_details,
        }
        const pData = {
          id: doc.id,
          pickupLocationData:doc.data().pickup_location,
        }
        const dData = {
          id: doc.id,
          dropLocationData:doc.data().drop_location
        }
        const order = { 
          id: doc.id,
          orderData: doc.data(),
          // status:doc.data().status,
          // transporterData: doc.data().transporter_details,
          // pickupLocationData:doc.data().pickup_location,
          // dropLocationData:doc.data().drop_location
        };
        
        DD.push(order);
        STATUS.push(status);
        TDATA.push(tData);
        PDATA.push(pData);
        
        DDATA.push({
          "Id": dData.id,
          // "Last Name": dData.dropLocationData.last_name,
          "Status":status.status,
          // "Transporter Uid":tData.transporter_uid,
          "Transporter_Phone_Number":tData.transporterData.phone_number,
          "GST_Number":tData.transporterData.gst_number,
          "Transporter_Name":tData.transporterData.first_name + " " + tData.transporterData.last_name,
          "DeliveredBy":dData.dropLocationData.first_name + " " +dData.dropLocationData.last_name,
          "Delivered_Phone_Number":dData.dropLocationData.phone_number,
          "Email":dData.dropLocationData.email,
          "Pin_Code":dData.dropLocationData.pincode,
          "Area":dData.dropLocationData.area,
          "City":dData.dropLocationData.city,
          "State":dData.dropLocationData.state,
          "Country":dData.dropLocationData.country,
          "PickupBy":pData.pickupLocationData.first_name + " " + pData.pickupLocationData.last_name,
          "Pickup_Phone_Number":pData.pickupLocationData.phone_number,
          "Pickup_Pin_Code":pData.pickupLocationData.pincode,
          "Pickup_Flat_Name":pData.pickupLocationData.flat_name,
          "Pickup_Area":pData.pickupLocationData.area,
          "Pickup_City":pData.pickupLocationData.city,
          "Pickup_Country":pData.pickupLocationData.country,
          "Dimensions":pData.pickupLocationData.dimensions,
          "Parcel_Value":pData.pickupLocationData.parcel_value,
          "Pickup_Time":pData.pickupLocationData.pickup_date_time
        });

      });
     

      let count = 1;
      // console.log(flatten(DD))  
      if(DD.length == 0 ){
        console.log("if")
        req.flash("error_msg", "There is no order found");
        return res.redirect("/order/list");     
      }else{
        console.log("else")
//         // return res.send(DDATA)
//         // console.log(DDATA);
//         let exceloutput = Date.now() + "output.xlsx"        
//         let xls = json2xls(DDATA);
// // console.log(xls,"bfahdbahsdbash")
//         fs.writeFileSync(exceloutput, xls, 'binary');
//         var filename = path.basename(exceloutput);
//         var mimetype = mime.lookup(exceloutput);
//         console.log(mimetype)
//         res.setHeader('Content-disposition', 'attachment; filename=' + filename);
//         res.setHeader('Content-type', mimetype);
//         // console.log(filename)

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Order Details');
        
         
        worksheet.columns = [
        
        { header:'ID',key:'id',width:30 },        
        { header:'Status',key:'status',width:20 },

        // transporter Details
        { header:'Transporter Name',key:'tr_name',width:20 },
        { header:'Phone Number',key:'tphone_number',width:15 },
        { header:'GST Number',key:'gst_number',width:20 },
        
        //droplocation
        { header:'Delivered By',key:'delivered_by',width:15 },
        { header:'Phone Number',key:'dphone_number',width:15 },
        { header:'Email',key:'demail',width:25 },
        { header:'Area',key:'darea',width:20 },
        { header:'City',key:'dcity',width:20 },
        { header:'State',key:'dstate',width:10 },
        { header:'Country',key:'dcountry',width:10 },

        //pickup location
        { header:'Pickup By',key:'pickup_by',width:15 },
        { header:'Pickup Phone Number',key:'pphone_number',width:20 },
        { header:'Flat Name',key:'pflat_name',width:20 },
        { header:'Area',key:'parea',width:20 },
        { header:'City',key:'pcity',width:20 },
        { header:'Country',key:'pcountry',width:10 },
        { header:'PinCode',key:'ppincode',width:10 },
        { header:'Parcel Value',key:'parcel_value',width:15 },
        { header:'Dimensions',key:'dimensions',width:15 },
        { header:'Pickup Time',key:'pickup_date_time',width:25 },
        ]
        
        
        worksheet.mergeCells('A1', 'V2');
        worksheet.getCell('A1').value = `Order Details Start Date:${startDate}`+` To `+ ` End Date:${endDate}`
        worksheet.getRow(4).values = ['ID', 'Status', 'Transporter Name', 'Phone Number','GST Number','Delivered By','Phone Number','Email','Area','City','State','Country','Pickup By','Pickup Phone Number','Flat Name','Area','City','Country','PinCode','Parcel Value','Dimensions','Pickup Time'];
        worksheet.getRow(4).eachCell((cell)=>{
                cell.font = {bold:true}
              });
        DDATA.map((A)=>{
          console.log(A,"stAAAAA")
          worksheet.addRow({
            id:A.Id,
            status:A.Status,
            tr_name:A.Transporter_Name,
            tphone_number:A.Transporter_Phone_Number,
            gst_number:A.GST_Number,
            delivered_by:A.DeliveredBy,
            dphone_number:A.Delivered_Phone_Number,
            demail:A.Email,
            darea:A.Area,
            dcity:A.City,
            dstate:A.State,
            dcountry:A.Country,
            pickup_by:A.PickupBy,
            pphone_number:A.Pickup_Phone_Number,
            pflat_name:A.Pickup_Flat_Name,
            parea:A.Pickup_Area,
            pcity:A.Pickup_City,
            // pstate:A.,
            pcountry:A.Pickup_Country,
            ppincode:A.Pickup_Pin_Code,
            parcel_value:A.Parcel_Value,
            dimensions:A.Dimensions,
            pickup_date_time:A.Pickup_Time,
          })
        })
        
        // worksheet.addRow(DDATA);
        
        let exceloutput = `Order Details`+`From${startDate}`+`TO${endDate}.xlsx`

        var filename = path.basename(exceloutput);
        var mimetype = mime.lookup(exceloutput);

        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', mimetype);
        await workbook.xlsx.writeFile(exceloutput);
        console.log("done")
        
        return res.download(filename, (err) => {
          if (err) {
            fs.unlinkSync(exceloutput)
            console.log(err)
          }
          fs.unlinkSync(exceloutput)
        })
        // var filestream = fs.createReadStream(exceloutput)
        // return res.status(200).json({
        //   data: { file: filestream, mimetype, filename: exceloutput  }
        // })
        // console.log(filestream)
        // filestream.pipe(res);

        // console.log("Order REs", res)
        // res.download(exceloutput);
        //  res.download(exceloutput,(err) => {
        //   if(err){
        //       // fs.unlinkSync(exceloutput)
        //       res.send("Unable to download the excel file")
        //   }
          // fs.unlinkSync(exceloutput)
        
        
            // res.sendFile(exceloutput);
        

        
          // return res.render("Order/displayOrders", {
          //         orders: DD,
          // })
      // })
      
    //     DD.forEach((order)=>{
    //       // console.log(order,"orderlist")
    //       order.s_no = count;
    //       order.orderData.s_no = count
    //       order.orderData.transporter_details.s_no = count
    //       order.orderData.pickup_location.s_no = count
    //       order.orderData.drop_location.s_no = count
    //       // workSheet.addRow(order.orderData);
    //       // workSheet.mergeCellsWithoutStyle(`C${count}:C${count+=1}`)  
    //       workSheet.addRow(order)
    //       workSheet.addRow(order.orderData);
    //       workSheetoftransporterdetails.addRow(order.orderData.transporter_details)
    //       workSheetofdroplocation.addRow(order.orderData.drop_location)
    //       workSheetpicklocation.addRow(order.orderData.pickup_location);
    //       count += 1;
    //     });
    //     workSheet.getColumn(4,5).alignment = {horizontal: 'center'}
    //     // workSheet.mergeCells('C2:C3')
    //     workSheet.getRow(1).eachCell((cell)=>{
    //       cell.font = {bold:true}
    //     });
    //     workSheetoftransporterdetails.getRow(1).eachCell((cell)=>{
    //       cell.font = {bold:true}
    //     });
    //     workSheetofdroplocation.getRow(1).eachCell((cell)=>{
    //       cell.font = {bold:true}
    //     });
    //     workSheetpicklocation.getRow(1).eachCell((cell)=>{
    //       cell.font = {bold:true}
    //     });
        
    // //     const dt = await workbook.xlsx.writeFile(`${path}/users.xlsx`)
    // //  .then(() => {
    // //    res.send({
    // //      status: "success",
    // //      message: "file successfully downloaded",
    // //      path: `${path}/users.xlsx`,
    // //     });
    // //  });
    //     const dt = await workbook.xlsx.writeFile("Detailse.xlsx")
    //       // res.send("done");
    //       return res.render("Order/displayOrders", {
    //           message: "file successfully downloaded",
    //           orders: DD,
    //       })
  
      }
      
      // console.log(DD,"??????????????????All ID ???????")
      // return res.render("Order/displayOrders", {
      //   orders: DD,
      // });
    } catch (error) {
      const errors = [];
      errors.push(error.message);
      return res.render("Order/displayOrders", {
        errors: errors,
      });
    }
  
}


exports.orderDetails = async (req, res) => {
  try {
    const id = req.params.order_id;
    let transporter, driver, customer, order, vehicle;

    const getOrderById = await db.collection("order_details").doc(id);
    const data = await getOrderById.get();
    if (data.data() == undefined) {
      req.flash("error_msg", "Order not found...!!");
      return res.redirect("/order/list");
    } else {
      const getCustomerById = await db
        .collection("users")
        .doc(data.data().requested_uid);
      const getCustomer = await getCustomerById.get();
      customer = {
        id: getCustomer.id,
        customerData: getCustomer.data(),
      };

      const getTransporterById = await db
        .collection("users")
        .doc(data.data().transporter_uid);
      const getTransporter = await getTransporterById.get();
      transporter = {
        id: getTransporter.id,
        transporterData: getTransporter.data(),
      };

      if (
        data.data().status === "pending" ||
        data.data().status === "rejected"
      ) {
        driver = {
          id: null,
          driverData: null,
        };
        vehicle = {
          id: null,
          vehicleData: null,
        };
      } else {
        const getTransporter = await db
          .collection("users")
          .doc(data.data().transporter_uid);
        const getVehicleById = await getTransporter
          .collection("vehicle_details")
          .doc(data.data().vehicle_details.vehicle_id);
        const getVehicle = await getVehicleById.get();
        vehicle = {
          id: getVehicle.id,
          vehicleData: getVehicle.data(),
        };

        if (
          data.data().transporter_uid === data.data().driver_details.user_uid
        ) {
          const getDriverById = await getTransporter
            .collection("driver_details")
            .doc(data.data().driver_details.driver_id);
          const getDriver = await getDriverById.get();
          driver = {
            id: getDriver.id,
            driverData: getDriver.data(),
          };
        } else {
          const getDriverById = await db
            .collection("users")
            .doc(data.data().driver_details.user_uid);
          const getDriver = await getDriverById.get();
          driver = {
            id: getDriver.id,
            driverData: getDriver.data(),
          };
        }
      }
      order = {
        id: data.id,
        orderData: data.data(),
        transporter: transporter,
        driver: driver,
        customer: customer,
        vehicle: vehicle,
      };
      // console.log("ORDER*********", order);

      return res.render("Order/orderDetails", {
        order: order,
      });
    }
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render("Errors/errors", { errors: errors });
  }
};

exports.endOrderTrip = async (req, res) => {
  try {
    const id = parseFloat(req.body.order_id);
    const order = await db.collection("order_details").where('order_id', '==', id).get();
    if (order.empty) {
      res.status(404).send({
        errors: [{
          msg: "Order not found."
        }]
      });
    } else {
      await order.docs[0].ref.update({
        status: "completed"
      })
      res.send({
        message: "Order status updated to 'completed'."
      });
    }
  } catch (error) {
    console.log(error)
    const errors = [];
    errors.push({ msg: error.message });
    res.status(400).send({
      errors
    });
  }
};

//* TODO: if require  */

// exports.exportDetails = async (req,res) =>{
// // const id =  req.params
//   // console.log(id,"parameter");
// console.log( req.body,"requestBody")
// // let DD = [];
// // let oId = [];
//   // try {
//   //   const orders = [];
//   //   const data = await db.collection("order_details").get();
//   //   data.forEach((doc) => {
//   //     const order = { id: doc.id, orderData: doc.data() };
//   //     DD.push(order);
//   //   });
//   //   // DD.push(orders)
//   //   // console.log(DD,"filter order")
//   //   for(let i = 0; i<DD.length;i++){
//   //     oId.push(DD[i].id)
//   //   }
//   //   console.log(oId,"??????????????????All ID ???????")
//   //   // return res.render("Order/displayOrders", {
//   //   //   orders: orders,
//   //   // });
//   // } catch (error) {
//   //   const errors = [];
//   //   errors.push(error.message);
//   //   return res.render("Order/displayOrders", {
//   //     errors: errors,
//   //   });
//   // }
// }