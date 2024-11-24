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

  // List
  pathMasterSale: "sale-management/list",
  pathMasterProduct: "products-management/list",
  pathMasterPromotion: "promotion-management/list",

  // user
  pathRegister: "register",
  pathMasterUsers: "users/list",

  // upload
  pathUpload: "upload/create",

  //sale plan
  pathGetWorkPlanList: "work-plan/list",
  pathGetWorkPlanStep1: "work-plan/workplan_step1",
};
