"use client"
import * as React from "react"
import {
  ConeIcon,
  Frame,
  LayoutDashboard,
  LockIcon,
  PartyPopper,
  PieChart,
  Settings,
  Ticket,
  User2Icon,
} from "lucide-react"

import { NavLogo } from "@/components/nav-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import FooterCopyright from "./footer-copyright"
import {  IconBusinessplan,  IconClover,  IconMoneybag,  IconTransactionDollar } from "@tabler/icons-react"

import { NavMenuPay } from "./nav-menu-pay"

export const navMenuPayItems = [
  { 
    name: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Configuración",
    url: "/dashboard/configuration",
    icon: Settings,
    submenu: [
      { title: "Secciones Permisos", url: "/dashboard/configuration/sections-permissions" },
      { title: "Ajustes Generales", url: "/dashboard/configuration/general-settings" },
      { title: "Paises", url: "/dashboard/configuration/countries" },
     
      { title: "Ciudades", url: "/dashboard/configuration/cities" },
      { title: "Categorías", url: "/dashboard/configuration/categories" },
      { title: "Sub Categorías", url: "/dashboard/configuration/sub-categories" },
      { title: "Sub Géneros", url: "/dashboard/configuration/sub-genre" },
    ],
  },
  {
    name: "Escenarios",
    url: "/dashboard/venues",
    icon: Frame,
  },
  /*{
    name: "Permisos",
    url: "/roles",
    icon: LockIcon,
    submenu: [
      { title: "Secciones", url: "/dashboard/permissions/sections" },
      { title: "Permisos", url:  "/dashboard/permissions" },
      { title: "Asignar Permisos", url: "/dashboard/permissions/assign-permissions" },
    ],
  }, */
  {
    name: "Usuarios",
    url: "/dashboard/users",
    icon: User2Icon,
  },
  {
    name: "Organiadores",
    url: "/dashboard/companies",
    icon: ConeIcon,
  },
  
  
  /*{
    name: "Favoritos",
    url: "/dashboard/events",
    icon: IconClover,
  }, */
  {
    name: "Mis Eventos",
    url: "/dashboard/events",
    icon: PartyPopper,
  },
  {
    name: "Tickets",
    url: "/dashboard/tickets",
    icon: Ticket,
  },
  {
    name: "Extractos",
    url: "/dashboard/statements",
    icon: IconMoneybag,
  },
  {
    name: "Transacciones",
    url: "/dashboard/transactions",
    icon: IconTransactionDollar,
  },
  {
    name: "Pérfil Organizador",
    url: "/dashboard/companies/profile",
    icon: IconBusinessplan,
  },
  {
    name: "Reportes",
    url: "/dashboard/report-generation",
    icon: PieChart,
    submenu: [
      { title: "Reportes", url: "/dashboard/report-generation" },
      { title: "Reportes paypac sum*", url: "/dashboard/report-generation/paypac-summary" },
      { title: "Reportes paypac", url: "/dashboard/report-generation/paypac" },
    ],
  },
]




export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        
         <NavLogo />
      </SidebarHeader>
      <SidebarContent>
      
        <NavMenuPay items={navMenuPayItems} />
        
      </SidebarContent>
      <SidebarFooter>
        <FooterCopyright/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
