import { onRequestPost as __api_auth_login_js_onRequestPost } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\auth\\login.js"
import { onRequestGet as __api_auth_logout_js_onRequestGet } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\auth\\logout.js"
import { onRequestPost as __api_auth_reset_confirm_js_onRequestPost } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\auth\\reset-confirm.js"
import { onRequestPost as __api_auth_reset_request_js_onRequestPost } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\auth\\reset-request.js"
import { onRequestPost as __api_me_password_js_onRequestPost } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\me\\password.js"
import { onRequestGet as __api_reports_consolidated_js_onRequestGet } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\reports\\consolidated.js"
import { onRequestGet as __api_settings_backup_js_onRequestGet } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\settings\\backup.js"
import { onRequestPost as __api_settings_backup_js_onRequestPost } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\settings\\backup.js"
import { onRequestPost as __api_users_password_js_onRequestPost } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\users\\password.js"
import { onRequestGet as __api_approve__month_year__js_onRequestGet } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\approve\\[month_year].js"
import { onRequestPost as __api_approve__month_year__js_onRequestPost } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\approve\\[month_year].js"
import { onRequestGet as __api_deductions__month_year__js_onRequestGet } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\deductions\\[month_year].js"
import { onRequestPost as __api_deductions__month_year__js_onRequestPost } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\deductions\\[month_year].js"
import { onRequestGet as __api_earnings__month_year__js_onRequestGet } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\earnings\\[month_year].js"
import { onRequestPost as __api_earnings__month_year__js_onRequestPost } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\earnings\\[month_year].js"
import { onRequestGet as __api_backup_js_onRequestGet } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\backup.js"
import { onRequestPost as __api_backup_js_onRequestPost } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\backup.js"
import { onRequestPost as __api_email_index_js_onRequestPost } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\email\\index.js"
import { onRequestGet as __api_employees_index_js_onRequestGet } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\employees\\index.js"
import { onRequestPost as __api_employees_index_js_onRequestPost } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\employees\\index.js"
import { onRequestPut as __api_employees_index_js_onRequestPut } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\employees\\index.js"
import { onRequestGet as __api_settings_index_js_onRequestGet } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\settings\\index.js"
import { onRequestPost as __api_settings_index_js_onRequestPost } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\settings\\index.js"
import { onRequestDelete as __api_users_index_js_onRequestDelete } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\users\\index.js"
import { onRequestGet as __api_users_index_js_onRequestGet } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\users\\index.js"
import { onRequestPost as __api_users_index_js_onRequestPost } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\api\\users\\index.js"
import { onRequest as ___middleware_js_onRequest } from "D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\payslip-ui\\functions\\_middleware.js"

export const routes = [
    {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_js_onRequestPost],
    },
  {
      routePath: "/api/auth/logout",
      mountPath: "/api/auth",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_logout_js_onRequestGet],
    },
  {
      routePath: "/api/auth/reset-confirm",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_reset_confirm_js_onRequestPost],
    },
  {
      routePath: "/api/auth/reset-request",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_reset_request_js_onRequestPost],
    },
  {
      routePath: "/api/me/password",
      mountPath: "/api/me",
      method: "POST",
      middlewares: [],
      modules: [__api_me_password_js_onRequestPost],
    },
  {
      routePath: "/api/reports/consolidated",
      mountPath: "/api/reports",
      method: "GET",
      middlewares: [],
      modules: [__api_reports_consolidated_js_onRequestGet],
    },
  {
      routePath: "/api/settings/backup",
      mountPath: "/api/settings",
      method: "GET",
      middlewares: [],
      modules: [__api_settings_backup_js_onRequestGet],
    },
  {
      routePath: "/api/settings/backup",
      mountPath: "/api/settings",
      method: "POST",
      middlewares: [],
      modules: [__api_settings_backup_js_onRequestPost],
    },
  {
      routePath: "/api/users/password",
      mountPath: "/api/users",
      method: "POST",
      middlewares: [],
      modules: [__api_users_password_js_onRequestPost],
    },
  {
      routePath: "/api/approve/:month_year",
      mountPath: "/api/approve",
      method: "GET",
      middlewares: [],
      modules: [__api_approve__month_year__js_onRequestGet],
    },
  {
      routePath: "/api/approve/:month_year",
      mountPath: "/api/approve",
      method: "POST",
      middlewares: [],
      modules: [__api_approve__month_year__js_onRequestPost],
    },
  {
      routePath: "/api/deductions/:month_year",
      mountPath: "/api/deductions",
      method: "GET",
      middlewares: [],
      modules: [__api_deductions__month_year__js_onRequestGet],
    },
  {
      routePath: "/api/deductions/:month_year",
      mountPath: "/api/deductions",
      method: "POST",
      middlewares: [],
      modules: [__api_deductions__month_year__js_onRequestPost],
    },
  {
      routePath: "/api/earnings/:month_year",
      mountPath: "/api/earnings",
      method: "GET",
      middlewares: [],
      modules: [__api_earnings__month_year__js_onRequestGet],
    },
  {
      routePath: "/api/earnings/:month_year",
      mountPath: "/api/earnings",
      method: "POST",
      middlewares: [],
      modules: [__api_earnings__month_year__js_onRequestPost],
    },
  {
      routePath: "/api/backup",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_backup_js_onRequestGet],
    },
  {
      routePath: "/api/backup",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_backup_js_onRequestPost],
    },
  {
      routePath: "/api/email",
      mountPath: "/api/email",
      method: "POST",
      middlewares: [],
      modules: [__api_email_index_js_onRequestPost],
    },
  {
      routePath: "/api/employees",
      mountPath: "/api/employees",
      method: "GET",
      middlewares: [],
      modules: [__api_employees_index_js_onRequestGet],
    },
  {
      routePath: "/api/employees",
      mountPath: "/api/employees",
      method: "POST",
      middlewares: [],
      modules: [__api_employees_index_js_onRequestPost],
    },
  {
      routePath: "/api/employees",
      mountPath: "/api/employees",
      method: "PUT",
      middlewares: [],
      modules: [__api_employees_index_js_onRequestPut],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api/settings",
      method: "GET",
      middlewares: [],
      modules: [__api_settings_index_js_onRequestGet],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api/settings",
      method: "POST",
      middlewares: [],
      modules: [__api_settings_index_js_onRequestPost],
    },
  {
      routePath: "/api/users",
      mountPath: "/api/users",
      method: "DELETE",
      middlewares: [],
      modules: [__api_users_index_js_onRequestDelete],
    },
  {
      routePath: "/api/users",
      mountPath: "/api/users",
      method: "GET",
      middlewares: [],
      modules: [__api_users_index_js_onRequestGet],
    },
  {
      routePath: "/api/users",
      mountPath: "/api/users",
      method: "POST",
      middlewares: [],
      modules: [__api_users_index_js_onRequestPost],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]