import React, { useContext } from "react";
import PDF from "../../components/pdf/MaterialExpensePDF";
import { AuthContext } from "../../contexts/AuthContext";


export default function PDFMaterialExpense() {
  const { userInfo } = useContext(AuthContext);

  console.log(userInfo);
  return <PDF title="Material Expense Report" userInfo={userInfo} />;
}
