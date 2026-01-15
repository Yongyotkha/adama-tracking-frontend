import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";
import "antd/dist/reset.css";
import Error403 from "./pages/error/Error403";
import Error404 from "./pages/error/Error404";
import Error500 from "./pages/error/Error500";
import Error503 from "./pages/error/Error503";
import Login from "./pages/auth/Login";
import Verify from "./pages/auth/Verify";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ChangePassword from "./pages/auth/ChangePassword";
import Wiki from "./pages/wiki/Wiki";
import Dashboard from "./pages/dashboard/Dashboard";
import WorkPlan from "./pages/sale_plan/workplan/WorkPlan";
import WorkPlanCreate from "./pages/sale_plan/workplan/WorkPlanCreate";
import WorkPlanCreateStepTwo from "./pages/sale_plan/workplan/WorkPlanCreateStepTwo";
import SettingRole from "./pages/settings/role/SettingRole";
import SettingUser from "./pages/settings/user/SettingUser";
import LogUser from "./pages/settings/user/LogUser";
import ProfileUser from "./pages/settings/user/ProfileUser";
import CreateUser from "./pages/settings/user/CreateUser";
import EditUser from "./pages/settings/user/EditUser";
import SettingSale from "./pages/settings/sale/SettingSale";
import CreateSale from "./pages/settings/sale/CreateSale";
import EditSale from "./pages/settings/sale/EditSale";
import SettingProduct from "./pages/settings/product/SettingProduct";
import EditProduct from "./pages/settings/product/EditProduct";
import SettingPromotion from "./pages/settings/promotion/SettingPromotion";
import CreatePromotion from "./pages/settings/promotion/CreatePromotion";
import EditPromotion from "./pages/settings/promotion/EditPromotion";
import WorkPlanAreaCreate from "./pages/sale_plan/workplan/WorkPlanAreaCreate";
import WorkPlanSaleCreate from "./pages/sale_plan/workplan/WorkPlanSaleCreate";
import WorkPlanSaleByCrop from "./pages/sale_plan/workplan/WorkPlanSaleByCrop";
import RollingForecast from "./pages/sale_plan/rolling_forecast/RollingForecast";
import OrderList from "./pages/order/OrderList";
import CreateOrder from "./pages/order/CreateOrder";
import EditOrder from "./pages/order/EditOrder";
import OrderDetail from "./pages/order/OrderDetail";
import OrderWaitingList from "./pages/order/OrderWaitingList";
import Dealer from "./pages/customer/dealer/DealerList";
import EditInformation from "./pages/customer/dealer/EditInformation";
import SubDealer from "./pages/customer/sub_dealer/SubDealerList";
import CreateSubDealer from "./pages/customer/sub_dealer/CreateSubDealer";
import EditSubDealer from "./pages/customer/sub_dealer/EditSubDealer";
import Farmer from "./pages/customer/Farmers/FarmersList";
import FarmerCreate from "./pages/customer/Farmers/FarmersCreate";
import CameraView from "./pages/mobile/collect_points/CameraView";
import CustomerContactList from "./pages/customer/contact/List";
import CustomerContactFrom from "./pages/customer/contact/From";
import PointHistoryDetail from "./pages/mobile/order_history/PointHistoryDetail";
import AdvanceExpense from "./pages/expenses/advance/AdvanceExpense";
import PdfAdvanceExpense from "./pages/pdf/ViewAdvanceExpense";
import ProductClaim from "./pages/expenses/product_claim/ProductClaim";
import CreateClaimRequest from "./pages/expenses/product_claim/CreateClaimRequest";
import EditClaimRequest from "./pages/expenses/product_claim/EditClaimRequest";
import Traveling from "./pages/expenses/traveling/Traveling";
import ViewTraveling from "./pages/expenses/traveling/ViewTraveling";
import CreateTraveling from "./pages/expenses/traveling/CreateTraveling";
import EditTraveling from "./pages/expenses/traveling/EditTraveling";
import PdfTraveling from "./pages/pdf/ViewTraveling";
import ClearingExpense from "./pages/expenses/clearing/ClearingExpense";
import ViewOrder from "./pages/order/ViewOrder";
import ViewOrderWaiting from "./pages/order/ViewOrderWaiting";
import { ProtectedRoute, PublicRoute } from "./components/auth/ProtectedRoute";
import WorkPlanSaleByDealer from "./pages/sale_plan/workplan/WorkPlanSaleByDealer";
import FirstChangePassword from "./pages/auth/FirstChangePassword";

// START ------------- Activity ------------- START
import ActivityList from "./pages/activity/ActivityList";
import CreateActivity from "./pages/activity/CreateActivity";
import ActivityPlanList from "./pages/activity/activity_plan/ActivityPlanList";
import ActivityCalendar from "./pages/activity/calendar/ActivityCalendar";
import ActivityMapping from "./pages/activity/mapping/ActivityMapping";
import WorkPlanSaleBySubDealer from "./pages/sale_plan/workplan/WorkPlanSaleBySubDealer";
import RollingForecastQuarter from "./pages/sale_plan/rolling_forecast/RollingForecastQuarter";
import RollingForecastMonth from "./pages/sale_plan/rolling_forecast/RollingForecastMonth";
import ActivityPlanDealer from "./pages/activity/activity_plan/ActivityPlanDealer";
import ActivityPlanSubDealer from "./pages/activity/activity_plan/ActivityPlanSubDealer";
import RollingForecastDealer from "./pages/sale_plan/rolling_forecast/RollingForecastDealer";
import WorkPlanSaleByDealerMonth from "./pages/sale_plan/workplan/WorkPlanSaleByDealerMonth";
import ReportSaleByMonth from "./pages/report/ReportSaleByMonth";
import ReportSaleByQuarter from "./pages/report/ReportSaleByQuarter";
import ReportSaleByYear from "./pages/report/ReportSaleByYear";
import ReportActivity from "./pages/report/ReportActivity";
import ReportActivityExpense from "./pages/report/ReportActivityExpense";
import ReportActivityByMonth from "./pages/report/ReportActivityByMonth";
import ReportActivityByType from "./pages/report/ReportActivityByType";
// END ------------- Activity ------------- END

// Phase 2
import Material from "./pages/settings/material/Material";
import ActionMaterial from "./pages/settings/material/ActionMaterial";
import MaterialExpense from "./pages/expenses/material_expense/MaterialExpense";
import ActionMaterialExpense from "./pages/expenses/material_expense/ActionMaterialExpense";
import SampleExpense from "./pages/expenses/sample_expense/SampleExpense";
import ActionSampleExpense from "./pages/expenses/sample_expense/ActionSampleExpense";
import Transaction from "./pages/settings/material/transaction";
import MyAccountMobile from "./pages/mobile/user/MyAccount";
import VerifyOA from "./pages/mobile/auth/VerifyOA";
import OtpOA from "./pages/mobile/auth/OtpOA";
import UserDetail from "./pages/mobile/user/UserDetail";
import EditUserOA from "./pages/mobile/user/EditUserOA";
import RegisterOA from "./pages/mobile/register/RegisterOA";
import MainOA from "./pages/mobile/main/MainOA";
import ActivityPlanDealerMonth from "./pages/activity/activity_plan/ActivityPlanDealerMonth";
import PDFClearingExpense from "./pages/pdf/PDFClearingExpense";

import CustomerStockEdit from "./pages/stock/customer-stock/CustomerStockEdit";
import CustomerStockView from "./pages/stock/customer-stock/CustomerStockView";
import CustomerStockCreate from "./pages/stock/customer-stock/CustomerStockCreate";
import CustomerStock from "./pages/stock/customer-stock/CustomerStock";

import CollectPoints from "./pages/mobile/collect_points/CollectPoints";
import RedeemPoint from "./pages/mobile/redeem_point/RedeemPoint";
import RedeemPointDetail from "./pages/mobile/redeem_point/RedeemPointDetail";
import RedeemPointConfirm from "./pages/mobile/redeem_point/RedeemPointConfirm";
import Promotion from "./pages/mobile/promotion/Promotion";
import PromotionDetail from "./pages/mobile/promotion/PromotionDetail";
// import ReportStock from "./pages/report/ReportStock";
import ContactUs from "./pages/mobile/user/settings/contact_us/ContactUs";
import FaqOA from "./pages/mobile/user/settings/faq/Faq";
import PrivacyPolicy from "./pages/mobile/user/settings/privacy_policy/PrivacyPolicy";
import TermsConditions from "./pages/mobile/user/settings/terms_conditions/TermsConditions";
import CheckLogin from "./pages/mobile/auth/CheckLogin";
import { LineOARoute, LinePrivateRoute } from "./components/auth/LineOARoute";
import CustomerLineList from "./pages/settings/mobile/customer/CustomerLineList";
import CreateCustomerLine from "./pages/settings/mobile/customer/CreateCustomerLine";
import ExpirePointList from "./pages/settings/mobile/expire_point/ExpirePointList";
// import ManagePromotionList from "./pages/settings/mobile/manage-promotion/ManagePromotionList";
// import CreateManagePromotion from "./pages/settings/mobile/manage-promotion/CreateManagePromotion";
import ApprovalAdvanceExpense from "./pages/expenses/advance/ApprovalAdvanceExpense";
import ApprovalClearingExpense from "./pages/expenses/clearing/ApprovalClearingExpense";
import ContactAdmin from "./pages/mobile/contact_admin/ContactAdmin";
import TakePhoto from "./pages/mobile/take_photo/TakePhoto";
import CreateActivityManyShop from "./pages/activity/CreateActivityManyShop";
import OrderHistory from "./pages/mobile/order_history/OrderHistory";
import OrderHistoryDetail from "./pages/mobile/order_history/OrderHistoryDetail";
import PointHistory from "./pages/mobile/point_history/PointHistory";
import RedeemList from "./pages/settings/mobile/redeem_list/RedeemList";
import RedeemRequestList from "./pages/settings/mobile/redeem_request/RedeemRequestList";
import RedeemProduct from "./pages/settings/mobile/redeem_product/RedeemProduct";
import RegisteredCustomerList from "./pages/settings/mobile/registered_customer/RegisteredCustomerList";
import RegisteredCustomerDetail from "./pages/settings/mobile/registered_customer/RegisteredCustomerDetail";
import MileageManagement from "./pages/settings/mileage/MileageManagement";
import EditMileage from "./pages/settings/mileage/EditMileage";
import TranAddress from "./pages/mobile/user/settings/tran_address/TranAddress";
import CreateTranAddress from "./pages/mobile/user/settings/tran_address/CreateTranAddress";
import CollectPointsAdvance from "./pages/mobile/collect_points/CollectPointsAdvance";
import CollectPointsAdvance1 from "./pages/mobile/collect_points/CollectPointsAdvance1";
import CollectPointsAdvance2 from "./pages/mobile/collect_points/CollectPointsAdvance2";
import CollectPointsAdvanceUpdate from "./pages/mobile/collect_points/CollectPointsAdvanceUpdate";
import EditOrViewCustomerLine from "./pages/settings/mobile/customer/EditOrViewCustomerLine";
import EditOrViewRegisteredCustomer from "./pages/settings/mobile/registered_customer/EditOrViewRegisteredCustomer";
import SalesPointsList from "./pages/settings/mobile/sale_point/SalesPointsList";
// import CreateSalesPoint from "./pages/settings/mobile/sale_point/CreateSalesPoint";
import SalesPointDetail from "./pages/settings/mobile/sale_point/SalesPointDetail";
import SalesPointCreate from "./pages/settings/mobile/sale_point/SalesPointCreate";
import SalesPointView from "./pages/settings/mobile/sale_point/SalesPointView";
// import SalesPointRequestCreate from "./pages/settings/mobile/sale_point/SalesPointRequestCreate";
import InfoList from "./pages/settings/mobile/info/InfoList";
import ActionInfo from "./pages/settings/mobile/info/ActionInfo";
import ViewOrEditInfo from "./pages/settings/mobile/info/ViewOrEditInfo";
import TargetGroupList from "./pages/settings/mobile/target_group/TargetGroupList";
import CreateTargetGroup from "./pages/settings/mobile/target_group/CreateTargetGroup";
import PointCampaignList from "./pages/settings/mobile/point_campaign/PointCampaignList";
import CreatePointCampaign from "./pages/settings/mobile/point_campaign/CreatePointCampaign";
import RewardCampaignList from "./pages/settings/mobile/reward_campaign/RewardCampaignList";
import CreateRewardCampaign from "./pages/settings/mobile/reward_campaign/CreateRewardCampaign";
import ViewOrEditTargetGroup from "./pages/settings/mobile/target_group/ViewOrEditTargetGroup";
import CollectPointsDetail from "./pages/mobile/collect_points/CollectPointsDetail";
import CollectPointsList from "./pages/settings/mobile/collect_points/CollectPointsList";
import RedeemDetail from "./pages/settings/mobile/redeem_list/RedeemDetail";
import Transportation from "./pages/settings/mobile/transportation/Transportation";
import RewardProductUpdateStock from "./pages/settings/mobile/request_purchase/RewardProductUpdateStock";
import RequestPurchaseList from "./pages/settings/mobile/request_purchase/RequestPurchaseList";
import TransportationDetail from "./pages/settings/mobile/transportation/TransportationDetail";
import SalesPointRequestMode from "./pages/settings/mobile/sale_point/SalesPointRequestMode";
import SalesPointActionMode from "./pages/settings/mobile/sale_point/SalesPointActionMode";
import CollectPointsView from "./pages/settings/mobile/collect_points/CollectPointsView";
import SalesPointEdit from "./pages/settings/mobile/sale_point/SalesPointEdit";
import RequestPurchaseDetail from "./pages/settings/mobile/request_purchase/RequestPurchaseDetail";
import NewsPromotionList from "./pages/settings/mobile/news_promotion/NewsPromotionList";
import CreateNewsPromotion from "./pages/settings/mobile/news_promotion/CreateNewsPromotion";
import ShippingAddressPDF from "./pages/pdf/ShippingAddressPDF";
import DeliverySlipPDF from "./pages/pdf/DeliverySlipPDF";
import SaleHistoryReport from "./pages/settings/mobile/report/SaleHistoryReport";
import ReportStock from "./pages/report/ReportStock";
import ReportSellOutBySales from "./pages/report/ReportSellOutBySales";
import ReportSellOutByDealer from "./pages/report/ReportSellOutByDealer";
import ReportSellOutBySubDealer from "./pages/report/ReportSellOutBySubDealer";
import ReportSellOut from "./pages/report/ReportSellOut";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<PublicRoute />}>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<Verify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route
              path="/first-change-password"
              element={<FirstChangePassword />}
            />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />

            {/* Work Plan Route */}
            <Route path="/sale-plan/work-plan" element={<WorkPlan />} />
            <Route path="/sale-plan/work-plan-area" element={<WorkPlan />} />
            <Route path="/sale-plan/work-plan-sale" element={<WorkPlan />} />
            <Route
              path="/sale-plan/work-plan/create"
              element={<WorkPlanCreate />}
            />
            <Route
              path="/sale-plan/work-plan/create-2"
              element={<WorkPlanCreateStepTwo />}
            />
            <Route
              path="/sale-plan/work-plan-area/sale-area-create"
              element={<WorkPlanAreaCreate />}
            />
            <Route
              path="/sale-plan/work-plan-sale/sale-create"
              element={<WorkPlanSaleCreate />}
            />
            <Route
              path="/sale-plan/work-plan-sale/sale-by-crop"
              element={<WorkPlanSaleByCrop />}
            />
            <Route
              path="/sale-plan/work-plan-sale/sale-by-dealer"
              element={<WorkPlanSaleByDealer />}
            />
            <Route
              path="/sale-plan/work-plan-sale/sale-by-dealer-month"
              element={<WorkPlanSaleByDealerMonth />}
            />
            <Route
              path="/sale-plan/work-plan-sale/sale-by-subdealer"
              element={<WorkPlanSaleBySubDealer />}
            />

            {/* Rolling Rorecast Route */}
            <Route
              path="/sale-plan/rolling-forecast"
              element={<RollingForecast />}
            />
            <Route
              path="/sale-plan/rolling-forecast-area"
              element={<RollingForecast />}
            />
            <Route
              path="/sale-plan/rolling-forecast-sale"
              element={<RollingForecast />}
            />
            <Route
              path="/sale-plan/rolling-forecast/month"
              element={<RollingForecastMonth />}
            />
            <Route
              path="/sale-plan/rolling-forecast/dealer"
              element={<RollingForecastDealer />}
            />
            <Route
              path="/sale-plan/rolling-forecast/quarter"
              element={<RollingForecastQuarter />}
            />

            {/* Activity Route */}
            <Route path="/activity/plan" element={<ActivityPlanList />} />
            <Route
              path="/activity/plan/dealer"
              element={<ActivityPlanDealer />}
            />
            <Route
              path="/activity/plan/sub-dealer"
              element={<ActivityPlanSubDealer />}
            />
            <Route
              path="/activity/plan/dealer/month/:mode"
              element={<ActivityPlanDealerMonth />}
            />

            <Route path="/activity/list" element={<ActivityList />} />
            <Route path="/activity/:mode" element={<CreateActivity />} />
            <Route
              path="/activity/creates"
              element={<CreateActivityManyShop />}
            />

            <Route path="/activity/calendar" element={<ActivityCalendar />} />
            <Route path="/activity/mapping" element={<ActivityMapping />} />

            {/* Order Route */}
            <Route path="/order/list" element={<OrderList />} />
            <Route path="/order/create" element={<CreateOrder />} />
            <Route path="/order/edit" element={<EditOrder />} />
            <Route path="/order/detail" element={<OrderDetail />} />
            <Route path="/order/view" element={<ViewOrder />} />
            <Route path="/order-waiting/list" element={<OrderWaitingList />} />
            <Route path="/order-waiting/view" element={<ViewOrderWaiting />} />

            {/* Customer Stock List */}
            <Route path="/customer-stock/list" element={<CustomerStock />} />
            <Route
              path="/customer-stock/:mode"
              element={<CustomerStockCreate />}
            />
            <Route
              path="/customer-stock/edit"
              element={<CustomerStockEdit />}
            />
            <Route
              path="/customer-stock/view"
              element={<CustomerStockView />}
            />

            {/* Expenses Route */}
            <Route path="/expenses/advance" element={<AdvanceExpense />} />
            <Route
              path="/expenses/advance/pdf"
              element={<PdfAdvanceExpense />}
            />
            <Route
              path="/expenses/product-claim-list"
              element={<ProductClaim />}
            />
            <Route
              path="/expenses/product-claim-waiting-list"
              element={<ProductClaim />}
            />
            <Route
              path="/expenses/product-claim/create"
              element={<CreateClaimRequest />}
            />
            <Route
              path="/expenses/product-claim/edit"
              element={<CreateClaimRequest />}
            />
            <Route path="/expenses/traveling" element={<Traveling />} />
            <Route
              path="/expenses/traveling/create"
              element={<CreateTraveling />}
            />
            <Route
              path="/expenses/traveling/edit"
              element={<EditTraveling />}
            />
            <Route
              path="/expenses/traveling/view"
              element={<ViewTraveling />}
            />
            <Route path="/expenses/traveling/pdf" element={<PdfTraveling />} />
            <Route path="/expenses/clearing" element={<ClearingExpense />} />
            <Route
              path="/expenses/clearing/pdf"
              element={<PDFClearingExpense />}
            />

            <Route path="/expenses/sample" element={<SampleExpense />} />
            <Route
              path="/expenses/sample/:mode"
              element={<ActionSampleExpense />}
            />

            <Route path="/expenses/material" element={<MaterialExpense />} />
            <Route
              path="/expenses/material/:mode"
              element={<ActionMaterialExpense />}
            />

            {/* Approval Expenses Route */}

            <Route
              path="/expenses/advance/approval/:role"
              element={<ApprovalAdvanceExpense />}
            />
            <Route
              path="/expenses/clearing/approval/:role"
              element={<ApprovalClearingExpense />}
            />

            {/* <Route path="/expenses/advance/approval/area" element={<AdvanceExpenseArea />} />
            <Route path="/expenses/advance/approval/head-of-sales" element={<AdvanceExpenseHead />} />
            <Route path="/expenses/advance/approval/accounting" element={<AdvanceExpenseAcct />} />
            <Route path="/expenses/clearing/approval/area" element={<ClearingExpenseArea />} />
            <Route path="/expenses/clearing/approval/head-of-sales" element={<ClearingExpenseHead />} />
            <Route path="/expenses/clearing/approval/accounting" element={<ClearingExpenseAcct />} /> */}

            {/* Customer Route */}
            <Route path="/customer/dealer" element={<Dealer />} />
            <Route
              path="/customer/dealer/edit-info"
              element={<EditInformation />}
            />
            <Route
              path="/customer/dealer/view-info"
              element={<EditInformation />}
            />

            <Route path="/customer/sub-dealer" element={<SubDealer />} />
            <Route
              path="/customer/sub-dealer/create"
              element={<CreateSubDealer />}
            />
            <Route
              path="/customer/sub-dealer/edit"
              element={<CreateSubDealer />}
            />
            <Route
              path="/customer/sub-dealer/view"
              element={<CreateSubDealer />}
            />

            {/* <Route path="/customer/sub-dealer/edit" element={<EditSubDealer />} /> */}
            {/* <Route path="/customer/sub-dealer/view" element={<EditSubDealer />} /> */}

            <Route path="/customer/farmers" element={<Farmer />} />
            <Route path="/customer/farmers/create" element={<FarmerCreate />} />

            <Route path="/customer/contact" element={<CustomerContactList />} />
            <Route
              path="/customer/contact/edit"
              element={<CustomerContactFrom />}
            />

            {/* Setting Route */}
            <Route path="/setting/log-login" element={<LogUser />} />

            <Route path="/setting/info/list" element={<InfoList />} />
            <Route path="/setting/info/create" element={<ActionInfo />} />
            <Route path="/setting/info/edit" element={<ActionInfo />} />
            <Route path="/setting/info/view" element={<ViewOrEditInfo />} />

            <Route path="/setting/role" element={<SettingRole />} />
            <Route path="/setting/profile" element={<ProfileUser />} />
            <Route path="/setting/user" element={<SettingUser />} />
            <Route path="/setting/user/create" element={<CreateUser />} />
            <Route path="/setting/user/edit" element={<EditUser />} />
            <Route path="/setting/user/view" element={<EditUser />} />

            <Route path="/setting/sale" element={<SettingSale />} />
            <Route path="/setting/sale/create" element={<CreateSale />} />
            <Route path="/setting/sale/edit" element={<EditSale />} />
            <Route path="/setting/product" element={<SettingProduct />} />
            <Route path="/setting/product/edit" element={<EditProduct />} />
            <Route path="/setting/promotion" element={<SettingPromotion />} />
            <Route
              path="/setting/promotion/create"
              element={<CreatePromotion />}
            />
            <Route path="/setting/promotion/edit" element={<EditPromotion />} />

            <Route path="/setting/material" element={<Material />} />
            <Route
              path="/setting/material/transaction"
              element={<Transaction />}
            />
            <Route
              path="/setting/material/:mode"
              element={<ActionMaterial />}
            />

            {/* Line OA Settings */}
            <Route
              path="/setting/line/target-group"
              element={<TargetGroupList />}
            />
            <Route
              path="/setting/line/target-group/create"
              element={<CreateTargetGroup />}
            />
            <Route
              path="/setting/line/target-group/:mode"
              element={<ViewOrEditTargetGroup />}
            />
            {/* <Route path="/setting/line/target-group/create" element={<CreateTargetGroup />} /> */}
            {/* <Route path="/setting/line/promotion/edit" element={<EditPromotion />} /> */}

            <Route
              path="/points/line/customer-support-list"
              element={<CustomerLineList />}
            />
            <Route
              path="/points/line/customer-support-list/:mode"
              element={<EditOrViewCustomerLine />}
            />

            {/* <Route path="/points/line/customer-support-list/view" element={<CustomerSupportView />} /> */}
            {/* <Route path="/points/line/customer-support-list/edit" element={<CustomerSupportEdit />} /> */}

            <Route
              path="/points/line/register-customer-list"
              element={<RegisteredCustomerList />}
            />
            <Route
              path="/points/line/register-customer-list/:mode"
              element={<EditOrViewRegisteredCustomer />}
            />
            <Route
              path="/points/line/register-customer/detail"
              element={<RegisteredCustomerDetail />}
            />
            <Route
              path="/points/line/customer-support/create"
              element={<CreateCustomerLine />}
            />
            {/* <Route path="/points/line/customer/edit" element={<EditCustomerLine />} /> */}

            <Route
              path="/points/line/sales-points-list"
              element={<SalesPointsList />}
            />
            {/* SalesPointActionMode = View + Edit + Create */}
            {/* <Route path="/points/line/sales-points-list/:mode" element={<SalesPointActionMode />} />  */}
            <Route
              path="/points/line/sales-points-list/create"
              element={<SalesPointCreate />}
            />
            <Route
              path="/points/line/sales-points-list/edit"
              element={<SalesPointEdit />}
            />
            <Route
              path="/points/line/sales-points-list/view"
              element={<SalesPointView />}
            />
            <Route
              path="/points/line/sales-points-list/detail"
              element={<SalesPointDetail />}
            />
            {/* <Route path="/points/line/sales-points-request/:mode" element={<SalesPointRequestMode />} /> */}

            <Route
              path="/points/line/collect-points-list"
              element={<CollectPointsList />}
            />
            <Route
              path="/points/line/collect-points-list/view"
              element={<CollectPointsView />}
            />
            {/* <Route path="/points/line/collect-points/create" element={<CollectPointCreate />} /> */}
            {/* <Route path="/points/line/collect-points/detail" element={<CollectPointDetail />} /> */}

            {/* <Route path="/points/line/sales-points-list/view" element={<SalesPointView />} /> */}
            {/* <Route path="/points/line/sales-points-list/:mode" element={<SalesPointDetail />} /> */}
            {/* <Route path="/points/line/sales-points-list/create" element={<CreateSalesPoint />} /> */}
            {/* <Route path="/points/line/sales-points-list/:mode" element={<ActionSalePoints />} /> */}

            {/* <Route path="/points/line/sales-points-request-create" element={<SalesPointRequestCreate />} /> */}

            <Route
              path="/setting/line/point-campaign"
              element={<PointCampaignList />}
            />
            <Route
              path="/setting/line/point-campaign/create"
              element={<CreatePointCampaign />}
            />
            <Route
              path="/setting/line/point-campaign/:mode"
              element={<CreatePointCampaign />}
            />

            <Route
              path="/setting/line/reward-campaign"
              element={<RewardCampaignList />}
            />
            <Route
              path="/setting/line/reward-campaign/:mode"
              element={<CreateRewardCampaign />}
            />

            <Route
              path="/setting/line/news-promotion"
              element={<NewsPromotionList />}
            />
            <Route
              path="/setting/line/news-promotion/:mode"
              element={<CreateNewsPromotion />}
            />

            {/* <Route path="/setting/line/reward-campaign/edit" element={<EditPromotion />} /> */}

            {/* <Route path="/setting/line/reward-campaign/:mode" element={<EditOrViewRewardCampaign />} /> */}

            <Route
              path="/points/line/expire-point"
              element={<ExpirePointList />}
            />
            {/* <Route path="/setting/line/point-campaign" element={<ManageNewsList />} /> */}
            {/* <Route path="/setting/line/point-campaign/create" element={<CreateManageNews />} /> */}
            {/* <Route path="/setting/line/reward-campaign" element={<ManagePromotionList />} /> */}
            {/* <Route path="/setting/line/reward-campaign/create" element={<CreateManagePromotion />} /> */}

            <Route
              path="/points/line/redeem-reward-list"
              element={<RedeemList />}
            />
            <Route
              path="/points/line/redeem-reward/:mode"
              element={<RedeemDetail />}
            />
            <Route
              path="/points/line/transportation"
              element={<Transportation />}
            />
            <Route
              path="/points/line/transpotation"
              element={<Transportation />}
            />

            <Route
              path="/points/line/transportation/:mode"
              element={<TransportationDetail />}
            />
            <Route
              path="/points/line/transpotation/:mode"
              element={<TransportationDetail />}
            />

            <Route
              path="/points/line/pdf/shipping-address"
              element={<ShippingAddressPDF />}
            />
            <Route
              path="/points/line/pdf/delivery-slip"
              element={<DeliverySlipPDF />}
            />

            <Route
              path="/setting/line/request-purchase"
              element={<RequestPurchaseList />}
            />

            <Route
              path="/setting/line/request-purchase/update-stock"
              element={<RewardProductUpdateStock />}
            />

            <Route
              path="/setting/line/redeem-request"
              element={<RedeemRequestList />}
            />
            <Route
              path="/setting/line/redeem-product"
              element={<RedeemProduct />}
            />

            <Route path="/setting/mileage" element={<MileageManagement />} />
            <Route path="/setting/mileage/edit" element={<EditMileage />} />

            {/* Report Route */}
            <Route path="/report/monthly" element={<ReportSaleByMonth />} />
            <Route path="/report/quarterly" element={<ReportSaleByQuarter />} />
            <Route path="/report/yearly" element={<ReportSaleByYear />} />
            <Route path="/report/activity" element={<ReportActivity />} />
            <Route
              path="/report/activity-expense"
              element={<ReportActivityExpense />}
            />
            <Route
              path="/report/activity-type"
              element={<ReportActivityByType />}
            />
            <Route
              path="/report/activity-month"
              element={<ReportActivityByMonth />}
            />
            <Route path="/report/stock-report" element={<ReportStock />} />
            <Route
              path="/report/sell-out-report-sales"
              element={<ReportSellOut />}
            />
            <Route
              path="/report/sell-out-report-dealer"
              element={<ReportSellOutByDealer />}
            />
            <Route
              path="/report/sell-out-report-sub-dealer"
              element={<ReportSellOut />}
            />
            <Route path="/report/sell-out-report" element={<ReportSellOut />} />

            {/* <Route path="/report/activity-expense" element={<ReportActivityExpense />} /> */}

            {/* <Route path="/report/stock-report" element={<ReportStock />} /> */}

            <Route
              path="/report/line/sales-history-report"
              element={<SaleHistoryReport />}
            />
          </Route>

          <Route element={<LineOARoute />}>
            <Route path="/mobile/login" element={<CheckLogin />} />

            <Route path="/mobile/verify" element={<VerifyOA />} />
            <Route path="/mobile/otp" element={<OtpOA />} />
            <Route path="/mobile/contact-admin" element={<ContactAdmin />} />
            <Route path="/mobile/contact-us" element={<ContactUs />} />
            <Route path="/mobile/tran-address" element={<TranAddress />} />
            <Route
              path="/mobile/tran-address/create"
              element={<CreateTranAddress />}
            />
            <Route path="/mobile/privacy-policy" element={<PrivacyPolicy />} />
            <Route
              path="/mobile/terms-conditions"
              element={<TermsConditions />}
            />
            <Route path="/mobile/faq" element={<FaqOA />} />
            <Route path="/mobile/register" element={<RegisterOA />} />
            <Route path="/mobile/camera" element={<CameraView />} />
            <Route element={<LinePrivateRoute />}>
              <Route
                path="/mobile/collect-points"
                element={<CollectPoints />}
              />
              <Route
                path="/mobile/collect-points/detail"
                element={<CollectPointsDetail />}
              />
              <Route
                path="/mobile/collect-points/advance-notice"
                element={<CollectPointsAdvance />}
              />
              <Route
                path="/mobile/collect-points/advance-notice1"
                element={<CollectPointsAdvance1 />}
              />
              <Route
                path="/mobile/collect-points/advance-notice2"
                element={<CollectPointsAdvance2 />}
              />
              <Route
                path="/mobile/collect-points/advance-notice-update"
                element={<CollectPointsAdvanceUpdate />}
              />
              <Route path="/mobile/promotion" element={<Promotion />} />
              <Route path="/mobile/account" element={<MyAccountMobile />} />
              <Route path="/mobile/user/detail" element={<UserDetail />} />
              <Route path="/mobile/user/edit" element={<EditUserOA />} />
              <Route path="/mobile/main" element={<MainOA />} />
              <Route path="/mobile/redeem-point" element={<RedeemPoint />} />
              <Route
                path="/mobile/redeem-point/detail"
                element={<RedeemPointDetail />}
              />
              <Route
                path="/mobile/redeem-point/confirm"
                element={<RedeemPointConfirm />}
              />
              <Route path="/mobile/order-history" element={<OrderHistory />} />
              <Route
                path="/mobile/order-history/detail"
                element={<OrderHistoryDetail />}
              />
              <Route path="/mobile/point-history" element={<PointHistory />} />
              <Route
                path="/mobile/point-history/detail"
                element={<PointHistoryDetail />}
              />
              <Route
                path="/mobile/promotion/detail/"
                element={<PromotionDetail />}
              />
            </Route>
          </Route>

          <Route path="/mobile/take-photo" element={<TakePhoto />} />

          {/* Error Route */}
          <Route path="/error/403" element={<Error403 />} />
          <Route path="*" element={<Error404 />} />
          <Route path="/error/500" element={<Error500 />} />
          <Route path="/error/503" element={<Error503 />} />
          <Route path="/wiki" element={<Wiki />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
