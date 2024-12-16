import { AdminWidget } from "@/components/dashboard/AdminWidget";
import { TableAdminWithdraw } from "@/components/table/table-admin-withdraw";
import TableByPass from "@/components/table/table-bypass-buy";

const WithdrawPage = () => {
  return (
    <div>
      <AdminWidget />
      <TableAdminWithdraw />
      <TableByPass />
    </div>
  );
};

export default WithdrawPage;
