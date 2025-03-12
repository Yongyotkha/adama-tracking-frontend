import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MessageLayout from "../../../layouts/MessageLayout";


export default function CheckLogin() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  return (
    <MessageLayout loading={true} >
      
    </MessageLayout>
  );
}
