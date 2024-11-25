// API EndPoint
export const endPoint = "https://adama-api.mtsc.co.th/api";
// export const endPoint = "http://localhost:8080/api";

export const paths = {
  // Login
  pathVerifyOtp: "verify-otp",
  pathCustomerDealer: "sale-customer-dealer/list",
  pathCustomerSubDealer: "sale-customer-subdealer/list",

  // Master
  pathMasterPosition: "master/position",
  pathMasterDepartments: "master/departments",
  pathMasterTerritory: "master/territory",
  pathMasterAreas: "master/areas",
  pathMasterRoles: "master/roles",
  pathMasterCrop: "master/crop",
  pathMasterStatus: "master/status",

  // List
  pathMasterSale: "sale-management/list",
  pathMasterProduct: "products-management/list",
  pathMasterPromotion: "promotion-management/list",
  
  // user
  pathRegister: "register",
  pathMasterUsers: "users/list",

  //promotion
  pathPromotionlist: "promotion-management/list",
  pathPromotiondetail: "promotion-management/detail",
  pathPromotionupdate: "promotion-management/update",

  
  // upload
  pathUpload: "upload/create",
};
