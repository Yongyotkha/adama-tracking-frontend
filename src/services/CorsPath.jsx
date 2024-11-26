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
  pathMasterCrop: "master/crop",

  pathMasterStatus: "master/status",
  pathMasterHeadofsale: "master/headofsale",
  pathMasterUserlist: "master/users/list",
  pathMasterSalearea: "master/salearea",

  
  // Sale
  pathSaleManagementDetail: "sale-management/sale-team/detail",
  pathSaleManagementCreate: "sale-management/sale-team/items/create",
  pathSaleManagementDeleteSubItem: "sale-management/sale-team/items/delete",

  // List
  pathMasterSale: "sale-management/list",
  pathMasterProduct: "products-management/list",
  pathMasterPromotion: "promotion-management/list",

  pathMasterActivityType: "master/activity-type",
  pathMasterSaleDropdown: "master/sale",
  pathMasterDealerDropdown: "master/dealer",

  // List
  // ! Issue: พี่ทำการเปลี่ยน Path ให้อ้างอิงนะ
  pathSaleManagementList: "sale-management/list",
  pathProductManagementList: "products-management/list",
  pathPromotionManagementList: "promotion-management/list",


  // user
  pathRegister: "register",
  pathMasterUsers: "users/list",

  //promotion
  pathPromotionlist: "promotion-management/list",
  pathPromotiondetail: "promotion-management/detail",
  pathPromotionupdate: "promotion-management/update",
  pathPromotioncreate: "promotion-management/create",

  //Sale
  pathSaleManagementlist: "sale-management/list",

  // upload
  pathUpload: "upload/create",

  //sale plan
  pathGetWorkPlanList: "work-plan/list",
  pathGetWorkPlanStep1: "work-plan/workplan_step1",

  //Activaty
  pathActivatyList: "/activity/list",

  // Orders
  pathGetOrderList: "order/list",
};
