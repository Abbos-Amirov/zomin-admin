import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import OrderService from "../../services/Order.service";
import { serverApi, socket } from "../../lib/config";
import { mapLinkDineInRow, type LinkDineInOrderView } from "../../lib/linkDineInOrderMapping";
import { playNotificationSound } from "../../lib/utils/playNotificationSound";
import { store } from "../store";
import {
  openLinkDineAlert,
  setLinkDineInOrders,
  setLinkDinePendingAckIds,
} from "../../screens/dashboardPage/slice";
import { retrieveLinkDineInOrders } from "../../screens/dashboardPage/selector";
import LinkDineInNewOrderDialog from "./LinkDineInNewOrderDialog";

/**
 * Barcha admin layoutda link dine-in ro'yxati + pending badge + yangi buyurtma alerti
 * (Buyurtmalar holati sahifasida bo'lmasa ham).
 */
export default function LinkDineInGlobalSync() {
  const dispatch = useDispatch();
  const linkDineInOrders = useSelector(retrieveLinkDineInOrders);

  const resolveImageUrl = useCallback((path?: string | null): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const base = serverApi.endsWith("/") ? serverApi.slice(0, -1) : serverApi;
    return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
  }, []);

  const fetchLinkDineInOrders = useCallback(async (): Promise<void> => {
    try {
      const orderSvc = new OrderService();
      const linkRows = await orderSvc.getLinkDineInOrders();
      const linkViews: LinkDineInOrderView[] = [];
      for (const row of linkRows) {
        const v = mapLinkDineInRow(row, resolveImageUrl);
        if (v) linkViews.push(v);
      }
      dispatch(setLinkDineInOrders(linkViews));
    } catch (linkErr) {
      console.warn("LinkDineInGlobalSync fetchLinkDineInOrders:", linkErr);
      dispatch(setLinkDineInOrders([]));
    }
  }, [dispatch, resolveImageUrl]);

  useEffect(() => {
    fetchLinkDineInOrders();
    const id = window.setInterval(() => {
      fetchLinkDineInOrders();
    }, 10_000);
    return () => window.clearInterval(id);
  }, [fetchLinkDineInOrders]);

  useEffect(() => {
    const refreshBySocket = () => {
      fetchLinkDineInOrders();
    };
    const refreshByAnyOrderEvent = (eventName: string) => {
      if (String(eventName).toLowerCase().includes("order")) {
        fetchLinkDineInOrders();
      }
    };
    socket.on("newOrder", refreshBySocket);
    socket.on("orderCreated", refreshBySocket);
    socket.on("orderUpdated", refreshBySocket);
    socket.on("order", refreshBySocket);
    socket.onAny(refreshByAnyOrderEvent);
    return () => {
      socket.off("newOrder", refreshBySocket);
      socket.off("orderCreated", refreshBySocket);
      socket.off("orderUpdated", refreshBySocket);
      socket.off("order", refreshBySocket);
      socket.offAny(refreshByAnyOrderEvent);
    };
  }, [fetchLinkDineInOrders]);

  const isFirstLinkDineFetchRef = useRef(true);
  const knownLinkDineOrderIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const idsNow = new Set(linkDineInOrders.map((o) => o.orderId));
    const prevArr = store.getState().dashboardPage.linkDinePendingAckIds ?? [];
    const next = new Set(prevArr);
    Array.from(next).forEach((id) => {
      if (!idsNow.has(id)) next.delete(id);
    });

    if (isFirstLinkDineFetchRef.current) {
      isFirstLinkDineFetchRef.current = false;
      knownLinkDineOrderIdsRef.current = idsNow;
      dispatch(setLinkDinePendingAckIds(Array.from(next)));
      return;
    }
    const newOnes = linkDineInOrders.filter((o) => !knownLinkDineOrderIdsRef.current.has(o.orderId));
    knownLinkDineOrderIdsRef.current = idsNow;
    if (newOnes.length > 0) {
      newOnes.sort((a, b) => {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
      });
      newOnes.forEach((o) => next.add(o.orderId));
      dispatch(openLinkDineAlert(newOnes));
      playNotificationSound();
    }
    dispatch(setLinkDinePendingAckIds(Array.from(next)));
  }, [linkDineInOrders, dispatch]);

  return (
    <>
      <LinkDineInNewOrderDialog />
    </>
  );
}
