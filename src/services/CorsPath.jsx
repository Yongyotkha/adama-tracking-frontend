// API EndPoint
export const endPoint = "https://adama-api.mtsc.co.th/api";
// export const endPoint = "http://localhost:8080/api";

export const paths = {
  // Login
  pathVerifyOtp: "verify-otp",
  pathOtpCall: "otp/call",
  pathOtpVerify: "otp/verify",
  pathSetNewPassword: "set-newpassword",
  pathCustomerDealer: "sale-customer-dealer/list",
  pathCustomerSubDealer: "sale-customer-subdealer/list",

  // Master
  pathMasterPosition: "master/position",
  pathMasterDepartments: "master/departments",
  pathMasterTerritory: "master/territory",
  pathMasterAreas: "master/areas",
  pathMasterRoles: "master/roles",
  pathMasterCrop: "master/crop",
  pathMasterActivityType: "master/activity-type",
  pathMasterDealerBySale: "master/dealer",
  pathMasterSale: "master/sale",

  // List
  // ! Issue: พี่ทำการเปลี่ยน Path ให้อ้างอิงนะ
  pathSaleManagementList: "sale-management/list",
  pathProductManagementList: "products-management/list",
  pathPromotionManagementList: "promotion-management/list",

  // user
  pathRegister: "register",
  pathMasterUsers: "users/list",

  // upload
  pathUpload: "upload/create",

  //sale plan
  pathGetWorkPlanList: "work-plan/list",
  pathGetWorkPlanStep1: "work-plan/workplan_step1",

  //Activaty
  pathActivatyList: "/activity/list",
};
