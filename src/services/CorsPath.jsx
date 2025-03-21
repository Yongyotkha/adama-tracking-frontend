// API EndPoint
export const endPoint = "https://adama-api.mtsc.co.th/api"; //Test API
// export const endPoint = "https://api-uat.adama.co.th/api"; //UAT API
// export const endPoint = "http://localhost:8080/api";

export const paths = {
  // Login
  pathVerifyOtp: "verify-otp",
  pathOtpCall: "otp/call",
  pathOtpVerify: "otp/verify",
  pathVerifyPhone: "otp/verify-phone",
  pathSetNewPassword: "set-newpassword",
  pathCustomerSubDealer: "sale-customer-subdealer/list",

  // OTP
  pathOtpShopCall: "/shop-otp/call",
  pathOtpShopVerify: "/shop-otp/verify",
  pathOtpverify: "shop-otp/verify-phone",
  
  // Master
  pathMasterUserAll: "master/sale-user-all",
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
  pathMasterSubDealer: "master/sub-dealer",
  pathMasterSubDealerAll: "master/sub-dealer-all",
  pathMasterSubDealerCrop: "master/sub-dealer-crop",
  pathMasterSubDealerCustomer: "master/sub-dealer-customer",
  pathMasterPermission: "master/permission",
  pathMasterProductUnit: "master/product-unit",
  pathMasterFarmer: "master/farmer-all",
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
  pathCustomerNetworkDelete: "sale-customer-dealer/network-delete",
  pathFarmerNetworkDelete: "sale-customer-dealer/network-farmer-delete",

  pathCustomerSubDealerList: "sale-customer-subdealer/list",
  pathCustomerSubDealerUpdate: "sale-customer-dealer/update",
  pathCustomerSubDealerNetworkUpdate: "sale-customer-dealer/network-create",
  pathCustomerSubDealerFarmerUpdate:
    "sale-customer-dealer/network-farmer-create",

  // Farmers
  pathCustomerFarmers: "sale-customer-farmer/list",
  pathCustomerFarmersCreate: "sale-customer-farmer/create",
  pathCustomerFarmersUpdate: "sale-customer-farmer/update",
  pathCustomerFarmersDetail: "sale-customer-farmer/detail",
  pathCustomerFarmersDelete: "sale-customer-farmer/delete",
  //SubDealer
  pathCreateSubDealer: "sale-customer-subdealer/create",
  pathDeleteSubDealer: "sale-customer-subdealer/delete",
  pathSubDealerDetail: "sale-customer-subdealer/detail",
  pathSubDealerDetailUpdate: "sale-customer-subdealer/update",
  pathSubDealerDetailUpdateFarmer:
    "sale-customer-subdealer/network-farmer-create",
  pathSubDealerDetailDeleteFarmer:
    "sale-customer-subdealer/network-farmer-delete",

  // dashbord
  pathDashBordCustomer: "dashboard/customer",
  pathDashBordExpense: "dashboard/expense",
  pathDashBordOrder: "dashboard/order",
  pathDashBordPlan: "dashboard/dealer/plan",
  pathDashBordTopActivity: "dashboard/activity/top",
  pathDashBordListActivity: "dashboard/activity/list",
  pathDashBordSubDealerPlan: "dashboard/sub_dealer/plan",
  pathDashBordSaleCrop: "dashboard/sale/crop",
  pathDashBordSaleByDealer: "dashboard/sale/sale_by_dealer",
  pathDashBoardSubDealerByDealer: "dashboard/sale/sub_sale_by_dealer",

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
  pathProfileChangePassword: "confirmChangePassword",
  pathProfileProfileimg: "user-update-image",

  //promotion
  pathPromotionlist: "promotion-management/list",
  pathPromotiondetail: "promotion-management/detail",
  pathPromotionupdate: "promotion-management/update",
  pathPromotioncreate: "promotion-management/create",
  pathPromotiondelete: "promotion-management/delete",

  //Sale
  pathSaleManagementlist: "sale-management/list",

  // upload
  pathUpload: "upload/create",

  // master select plan

  pathMasterWorkPlan: "master/plan-select",

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

  //rolling-forecast
  pathRollingForecast: "/rolling-forecast/sale/list",
  pathRollingForecastMonth: "/rolling-forecast/sale/detail",
  pathRollingForecastQuarter: "/rolling-forecast/sale/quarter",

  pathRollingForecastDealer: "/rolling-forecast/sale/dealer/list",
  pathRollingForecastDealerMonth: "/rolling-forecast/sale/dealer/month",

  //Activity
  pathActivityPlan: "/activity-plan/sale/list",
  pathActivitySubDealerList: "/activity-plan/sale/dealer/list",
  pathActivityDealerUpdate: "/activity-plan/sale/dealer/dealer/detail",
  pathActivitySubDealer: "/activity-plan/sale/dealer/detail",
  pathActivitySummary: "/activity-plan/sale/activity-summary",
  pathActivitySubDealerDetail: "/activity-plan/sale/dealer/sub-dealer/detail",

  pathActivityList: "/activity/list",
  pathActivityCreate: "/activity/create",
  pathActivityDetail: "/activity/detail",
  pathActivityMappingStatusDetail: "/activity/mapping/detail",
  pathActivityMappingStatusDetailUpdate: "/activity/mapping/detail",


  pathAdvanceApproval: "/activity-expense/advancechangestatus",
  pathClearingApproval: "/activity-expense/clearingchangestatus",

  pathActivityExpenseCreate: "/activity-expense/create",
  pathActivityExpenseDetail: "/activity-expense/detail",
  pathActivityExpenseList: "/activity-expense/list",
  pathActivityExpenseDelete: "/activity-expense/delete",

  // Activity Calendar
  pathActivityCalendarList: "/activity/calendar/list",
  // Activity Mapping
  pathActivityMapList: "/activity/map/list",

  // Orders
  pathGetOrderList: "order/list",
  pathGetOrderCreate: "order/create",
  pathGetOrderUpdate: "order/update",
  pathGetOrderDelete: "order/delete",
  pathGetOrderDetail: "order/detail",
  pathGetOrderWaitingList: "order/list",
  pathGetOrderChangeStatus: "order/status",

  // Expense Traveling
  pathGetExpenseTravelingList: "expense/traveling/list",
  pathGetExpenseTravelingDetail: "expense/traveling/detail",
  pathGetExpenseTravelingCreate: "expense/traveling/detail",
  pathGetExpenseTravelingUpdate: "expense/traveling/detail",

  // Expense Sample
  pathSampleExpenseList: "expense/sample/list",
  pathSampleExpenseDetails: "expense/sample/create",
  pathSampleGetDealer: "expense/sample/get-dealer-id",

  // Claim
  pathClaimList: "claim/list",
  pathClaimCreate: "claim/create",
  pathClaimDetail: "claim/detail",
  pathClaimUpdate: "claim/update",

  //report
  pathReportSaleByMonth: "report/sale/month",
  pathReportSaleByQuarter: "report/sale/quarter",
  pathReportSaleByYear: "report/sale/year",
  pathReportSaleByActivity: "report/sale/activity",

  // Line OA
  pathProfileDetail: "profile/detail",

  pathNewsPublicCategory: "news/public/category",
  pathNewsPublicListByCategory: "news/public/list",
  pathNewsPublicDetail: "news/public/detail",

  pathRegisterShop: "/shop/register",
  pathCheckLoginShop: "/shop/login",
  pathMasterContactType: "/master/contact_type",
  pathMasterContactUpdate: "/master/contact/update",

  pathPointPublicCategory: "point/public/category",
  pathPointPublicListByCategory: "point/public/list",
  pathPointPublicDetail: "point/public/detail",
};
