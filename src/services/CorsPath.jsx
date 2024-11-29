// API EndPoint
export const endPoint = "https://adama-api.mtsc.co.th/api";
// export const endPoint = "http://localhost:8080/api";

export const paths = {
  // Login
  pathVerifyOtp: "verify-otp",
  pathOtpCall: "otp/call",
  pathOtpVerify: "otp/verify",
  pathSetNewPassword: "set-newpassword",
  pathCustomerSubDealer: "sale-customer-subdealer/list",

  // Master
  pathMasterPosition: "master/position",
  pathMasterDepartments: "master/departments",
  pathMasterTerritory: "master/territory",
  pathMasterAreas: "master/areas",
  pathMasterRoles: "master/roles",
  pathMasterCrop: "master/crop",
  pathMasterProductTypes: "master/product-types",
  pathMasterProductGroups: "master/product-groups",
  pathMasterProductCategorys: "master/product-categorys",
  
  pathMasterProductByCrop: "master/product-by-crop",
  pathMasterSaleAll: "master/sale-all/list",
  pathMasterDealerCustomer: "master/dealer/customer",

  
  // pathMasterShop: "master/shop",
  pathMasterStatus: "master/status",
  pathMasterHeadofsale: "master/headofsale",
  pathMasterUserlist: "master/users/list",
  pathMasterSalearea: "master/salearea",
  pathMasterMonths: "master/months",
  pathMasterYear: "master/years",
  pathMasterPerception: "master/perception",

  //Products
  pathSaleManagementProductsList: "products-management/list",
  pathSaleManagementProductsDetail: "products-management/detail",
  pathSaleManagementProductsUpdate: "products-management/update",
  
  //Dealer
  pathCustomerDealer: "sale-customer-dealer/list",
  pathCustomerDealerDetail: "sale-customer-dealer/detail",
  pathCustomerSubDealerList: "sale-customer-subdealer/list",

  // Sale
  pathSaleManagementDetail: "sale-management/sale-team/detail",
  pathSaleManagementCreate: "sale-management/sale-team/items/create",
  pathSaleManagementDeleteSubItem: "sale-management/sale-team/items/delete",
  pathSaleManagementDeleteSub: "sale-management/sale-team/delete",

  pathMasterTime: "master/time",
  pathMasterProducts: "master/product",
  pathMasterProductDetail: "master/product/detail",

  pathMasterPromotionList: "master/promotion",
  pathMasterPromotionDetail: "master/promotion/detail",

  // List
  pathMasterSale: "sale-management/list",
  pathMasterProduct: "products-management/list",
  pathMasterPromotion: "promotion-management/list",

  pathMasterActivityType: "master/activity-type",
  pathMasterSaleDropdown: "master/sale",
  pathMasterDealerDropdown: "master/dealer",
  pathMasterDealerAll: "master/dealer-all",

  // List
  pathSaleManagementList: "sale-management/list",
  pathProductManagementList: "products-management/list",
  pathPromotionManagementList: "promotion-management/list",

  // user
  pathRegister: "register",
  pathMasterUsersCreate: "users/create",

  pathMasterUsers: "users/list",
  pathMasterUsersDetail: "users/detail",
  pathMasterUsersEdit: "user-update",

  //promotion
  pathPromotionlist: "promotion-management/list",
  pathPromotiondetail: "promotion-management/detail",
  pathPromotionupdate: "promotion-management/update",
  pathPromotioncreate: "promotion-management/create",

  //Sale
  pathSaleManagementlist: "sale-management/list",

  // upload
  pathUpload: "upload/create",

  //head plan
  pathGetWorkPlanList: "work-plan/list",
  pathWorkPlanStep1: "work-plan/workplan_step1",
  pathWorkPlanStep2: "work-plan/workplan_step2",

  //area plan
  pathGetWorkPlanAreaList: "/work-plan/area/list",
  pathWorkPlanAreaStep1: "/work-plan/area/workplan_step1",
  
  //sale plan
  pathGetWorkPlanSaleList: "/work-plan/sale/list",
  pathWorkPlanSaleQuarter: "/work-plan/sale/quarter",
  pathWorkPlanSaleCrop: "/work-plan/sale/crop",
  pathWorkPlanSaleDealer: "/work-plan/sale/dealer",
  pathWorkPlanSaleSubDealer: "/work-plan/sale/subdealer",
  pathWorkPlanSaleSubDealerList: "/work-plan/sale/subdealer/list",

  //Activity
  pathActivityList: "/activity/list",
  pathActivityCreate: "/activity/create",
  pathActivityDetail: "/activity/detail",
  // Activity Calendar
  pathActivityCalendarList: "/activity/calendar/list",
  
  // Orders
  pathGetOrderList: "order/list",
  pathGetOrderCreate: "order/create",
  pathGetOrderUpdate: "order/update",
  pathGetOrderDetail: "order/detail",
  pathGetOrderWaitingList: "order/list",
  pathGetOrderChangeStatus: "order/status",

  // Expense Traveling
  pathGetExpenseTravelingList: "expense/traveling/list",
  pathGetExpenseTravelingDetail: "expense/traveling/detail",
  pathGetExpenseTravelingCreate: "expense/traveling/detail",
  pathGetExpenseTravelingUpdate: "expense/traveling/detail",

};
