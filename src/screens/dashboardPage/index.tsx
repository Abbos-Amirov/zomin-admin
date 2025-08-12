import DashboardOverview from "./DashboardOverview";
import NotifAndCategory from "./notifiAndCategory/NotifAndCategory";
import QuickActions from "./QuickActions";
import TableStatus from "./TableStatus";
import TopItemsBar from "./TopItemsBar";

export default function DashboardPage(){
  return(
    <>
      <DashboardOverview/>
      <TableStatus/>
      <NotifAndCategory/>
      <TopItemsBar />
      <QuickActions/>
    </>
  )
}