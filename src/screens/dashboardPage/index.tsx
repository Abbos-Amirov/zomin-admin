import DashboardOverview from "./DashboardOverview";
import TopItemAndCategory from "./topItemAndCategory";
import QuickActions from "./QuickActions";
import TableStatus from "./TableStatus";

export default function DashboardPage(){
  return(
    <>
      <DashboardOverview/>
      <TableStatus/>
      <TopItemAndCategory/>
      <QuickActions/>
    </>
  )
}