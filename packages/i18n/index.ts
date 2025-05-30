import i18nBase from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

export const i18next = i18nBase.use(initReactI18next).init({
  debug: process.env.NODE_ENV !== "production",
  fallbackLng: "zh",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      translation: {
        hello: "Hello",
        tkt_one: "ticket",
        tkt_other: "tickets",
        team: "team",
        reports: "reports",
        klg_base: "knowledge base",
        ntfcs: "notifications",
        settings: "settings",
        docs_management: "docs management",

        area: "area",
        title: "title",
        category: "category",
        priority: "priority",
        status: "status",
        rqst_by: "requested by",
        created_at: "created at",
        updated_at: "updated at",
        sbmt_date: "submitted at",

        all: "all",
        pending: "pending",
        in_progress: "in progress",
        completed: "completed",
        scheduled: "scheduled",
        resolved: "resolved",

        no_results: "no results",
        rows_per_page: "rows per page",
        go_to_first_page: "go to first page",
        go_to_last_page: "go to last page",
        go_to_previous_page: "go to previous page",
        go_to_next_page: "go to next page",

        create: "create",
        columns: "columns",
        customize_columns: "customize columns",
        rows_selected_one: "{{all}} of {{selected}} row selected",
        rows_selected_other: "{{all}} of {{selected}} rows selected",
        page_number: "Page {{page}} of {{all}}",
        
        urgent: "urgent",
        high: "high",
        medium: "medium",
        low: "low",
        normal: "normal",

        urgent_desc: "emergency situation",
        high_desc: "business completely unavailable",
        medium_desc: "business/system anomaly affecting usage",
        low_desc: "operational experience issues",
        normal_desc: "general inquiry",
        uncategorized: "uncategorized",
        assign_category: "Assign Category",
        category_updated: "Category updated successfully",
        other: "other",
        bug: "bug",
        feature: "feature",
        question: "question",

        open_menu: "open menu",
        view_details: "view details",
        update_status: "update status",
        transfer: "transfer ticket",
        raise_request: "raise request",
        adjust_prty: "adjust priority",
        raise_req: "raise priority",
        mark_as_solved: "mark as solved",
        close: "close",

        community: "community",

        tkt: "ticket",
        tkt_list: "$t(tkt_other) list",
        tkt_system: "$t(tkt_other) system",
        tkt_create: "create $t(tkt_one)",
        tkt_edit: "edit $t(tkt_one)",
        tkt_delete: "delete $t(tkt_one)",
        tkt_view: "view $t(tkt_one)",
        tkt_status: "$t(tkt_other) status",
        tkt_status_pending: "pending",
        dashboard: "dashboard",

        // Modal common texts
        success: "Success",
        error: "Error",
        cancel: "Cancel",
        
        // Update Status Modal
        update_status_title: "Update Ticket Status",
        update_status_desc: "Change the status of ticket #{{id}}. This will notify all members of the ticket.",
        status_updated: "Ticket status updated successfully",
        failed_update_status: "Failed to update ticket status",
        select_status: "Select Status",
        status_change_reason: "Reason for Status Change",
        status_change_reason_ph: "Why are you changing the status of this ticket?",
        status_change_desc: "Provide a brief explanation for the status change",
        updating: "Updating...",
        
        // Transfer Modal
        transfer_ticket: "Transfer Ticket #{{id}}",
        transfer_desc: "Transfer this ticket to another staff member. The current assignee will be notified.",
        ticket_transferred: "Ticket transferred successfully",
        failed_transfer: "Failed to transfer ticket",
        select_staff: "Select Staff Member",
        search_staff: "Search staff members...",
        workload: "Workload",
        transfer_reason: "Transfer Reason",
        transfer_reason_ph: "Why are you transferring this ticket?",
        transferring: "Transferring...",
        transfer_ticket_btn: "Transfer Ticket",
        
        // Raise Requirement Modal
        raise_req_title: "Raise New Requirement",
        raise_req_desc_linked: "Create a new requirement linked to ticket #{{id}}",
        raise_req_desc_general: "Create a new requirement for system improvement or feature request",
        req_raised: "Requirement raised successfully",
        failed_raise_req: "Failed to raise requirement",
        req_title: "Title",
        req_title_ph: "Enter a clear title for the requirement",
        req_description: "Description",
        req_desc_ph: "Provide a detailed description of the requirement",
        req_desc_help: "Include all relevant details, expected behavior, and business value",
        submitting: "Submitting...",
        raise_req_btn: "Raise Requirement",

        // Error and Not Found Pages
        error_title: "Error",
        error_message: "Sorry, something went wrong",
        not_found_title: "Not Found",
        not_found_message: "The page you're looking for doesn't exist",
        go_back: "Go back",
        reset: "Reset",
        reload: "Reload",
        reset_login: "Reset login information",
        unauthorized_message: "Please login through the correct channel, or try refreshing the page",

        create_new_ticket: "Create new ticket",
        select: "Select",
        details: "Details",
        plz_pvd_info: "Provide information about your issue or request",
        title_ph: "Briefly describe your issue or request",

        module: "Module",
        
        applaunchpad: "App Management",
        costcenter: "Cost Center",
        appmarket: "App Market",
        db: "Database",
        account_center: "Account Center",
        aiproxy: "AI Proxy",
        devbox: "Devbox",
        task: "Task",
        cloudserver: "Cloud Server",
        objectstorage: "Object Storage",
        laf: "Laf Cloud Development",
        kubepanel: "Kubepanel",
        terminal: "Terminal",
        workorder: "Work Order",
        time: "time",
        occurrence_time: "occurrence $t(time)",

        occurrence_time_ph: "Select date and time of occurrence",
        type: "type",
        desc: "description",
        desc_ph: "Enter description here... Images can be dragged or pasted",

        plz_fill_all_fields: "Please fill in all required fields",
        missing_fields: "Missing required fields: {{fields}}",
        error_msg: "Error message",
        error_msg_ph: "Paste any error messages or logs",
        submit: "Submit",

        no_sth_found: "No {{sth}} found",
        try_adjust_filters: "Try adjusting filters",
        filter: "Filter",
        my: "My",
        active: "Active",
        unread: "Unread",
        search: "Search",
        view: "View",

        tktH: {
          create: "$t(tkt) creation",
          update: "$t(tkt) information update",
          assign: "$t(tkt) assigned to {{assignee}} by system",
          close: "$t(tkt) closed",
          upgrade: "$t(tkt) priority changed to - {{priority}}",
          resolve: "$t(tkt) marked as resolved",
          transfer: "$t(tkt) transferred to {{assignee}}",
          makeRequest: "Made a request",
          first_reply: "First response",
          join: "{{member}} joined the ticket",
          other: "$t(other)",
        },
        info: "Information",
        assigned_to: "Assigned to",
        last_updated: "Last updated $t(time)",
        dateTime: "{{val, datetime}}",
      },
    },
    zh: {
      translation: {
        dashboard: "面板",
        tkt_one: "工单",
        tkt_other: "工单",
        team: "团队",
        reports: "报告",
        klg_base: "知识库",
        settings: "设置",
        ntfcs: "通知",
        docs_management: "文档管理",

        area: "区域",
        title: "标题",
        category: "分类",
        priority: "优先级",
        status: "状态",
        rqst_by: "提交者",
        created_at: "创建时间",
        updated_at: "更新时间",
        sbmt_date: "提交时间",

        all: "全部",
        pending: "待处理",
        in_progress: "处理中",
        completed: "已完成",
        scheduled: "计划中",
        resolved: "已解决",

        no_results: "没有结果",
        rows_per_page: "每页行数",
        go_to_first_page: "转到第一页",
        go_to_last_page: "转到最后一页",
        go_to_previous_page: "转到上一页",
        go_to_next_page: "转到下一页",

        create: "新建",
        columns: "列",
        customize_columns: "自定义列",
        rows_selected_one: "已选择{{selected}}行（共{{all}}行）",
        rows_selected_other: "已选择{{selected}}行（共{{all}}行）",
        page_number: "第{{page}}页（共{{all}}页）",
        urgent: "紧急",
        high: "高",
        medium: "中",
        low: "低",
        normal: "正常",

        urgent_desc: "紧急情况",
        high_desc: "业务完全不可用",
        medium_desc: "业务/系统异常影响使用",
        low_desc: "操作体验问题",
        normal_desc: "普通咨询",
        uncategorized: "未分类",
        assign_category: "划分类别",
        category_updated: "分类成功",
        other: "其他",
        bug: "bug",
        feature: "功能",
        question: "问题",

        open_menu: "打开菜单",
        view_details: "查看详情",
        update_status: "更新状态",
        transfer: "转移工单",
        raise_request: "提需求",

        adjust_prty: "调整优先级",
        raise_req: "提高优先级",
        mark_as_solved: "标记为已解决",
        close: "关闭",

        community: "社区",

        tkt: "工单",
        tkt_list: "$t(tkt)列表",
        tkt_system: "$t(tkt)系统",
        tkt_create: "创建$t(tkt)",
        tkt_edit: "编辑$t(tkt)",
        tkt_delete: "删除$t(tkt)",
        tkt_view: "查看$t(tkt)",
        tkt_status: "$t(tkt)状态",
        tkt_status_pending: "待处理",

        // Modal common texts
        success: "成功",
        error: "错误",
        cancel: "取消",
        
        // Update Status Modal
        update_status_title: "更新工单状态",
        update_status_desc: "更改工单 #{{id}} 的状态。这将通知所有工单成员。",
        status_updated: "工单状态已成功更新",
        failed_update_status: "更新工单状态失败",
        select_status: "选择状态",
        status_change_reason: "状态变更原因",
        status_change_reason_ph: "为什么要更改这个工单的状态？",
        status_change_desc: "提供状态变更的简要说明",
        updating: "更新中...",
        
        // Transfer Modal
        transfer_ticket: "转移工单 #{{id}}",
        transfer_desc: "将此工单转移给另一位员工。当前负责人将收到通知。",
        ticket_transferred: "工单已成功转移",
        failed_transfer: "转移工单失败",
        select_staff: "选择员工",
        search_staff: "搜索员工...",
        workload: "工作量",
        transfer_reason: "转移原因",
        transfer_reason_ph: "为什么要转移这个工单？",
        transferring: "转移中...",
        transfer_ticket_btn: "转移工单",
        
        // Raise Requirement Modal
        raise_req_title: "提出新需求",
        raise_req_desc_linked: "创建与工单 #{{id}} 关联的新需求",
        raise_req_desc_general: "为系统改进或功能请求创建新需求",
        req_raised: "需求已成功提出",
        failed_raise_req: "提出需求失败",
        req_title: "标题",
        req_title_ph: "为需求输入一个清晰的标题",
        req_description: "描述",
        req_desc_ph: "提供需求的详细描述",
        req_desc_help: "包括所有相关细节、预期行为和业务价值",
        submitting: "提交中...",
        raise_req_btn: "提出需求",

        // Error and Not Found Pages
        error_title: "错误",
        error_message: "抱歉，出现了错误",
        not_found_title: "未找到",
        not_found_message: "您正在寻找的页面不存在",
        go_back: "返回",
        reset: "重置",
        reload: "刷新",
        reset_login: "重置登录信息",
        unauthorized_message: "请通过正确的渠道登录，或尝试刷新页面",

        create_new_ticket: "创建新工单",
        select: "选择",
        details: "详情",
        plz_pvd_info: "请提供有关您的问题或请求的信息",
        title_ph: "简要描述您的问题或请求",

        module: "模块",

        
        applaunchpad: "应用管理",
        costcenter: "费用中心",
        appmarket: "应用市场",
        db: "数据库",
        account_center: "账户中心",
        aiproxy: "AI Proxy",
        devbox: "Devbox",
        task: "任务",
        cloudserver: "云服务器",
        objectstorage: "对象存储",
        laf: "Laf云开发",
        kubepanel: "Kubepanel",
        terminal: "终端",
        workorder: "工单",
        time: "时间",
        occurrence_time: "发生$t(time)",

        occurrence_time_ph: "选择发生日期和时间",
        type: "类型",
        desc: "描述",
        desc_ph: "在此输入描述... 图片可以拖拽或粘贴",

        plz_fill_all_fields: "请填写所有必填字段",
        missing_fields: "缺少以下必填字段: {{fields}}",
        error_msg: "错误信息",
        error_msg_ph: "粘贴任何错误消息或日志",
        submit: "提交",


        no_sth_found: "没有找到{{sth}}",
        try_adjust_filters: "尝试调整过滤器",
        filter: "过滤器",
        my: "我的",
        active: "活跃",
        unread: "未读",
        search: "搜索",
        view: "查看",


        tktH: {
          create: "$t(tkt)创建",
          update: "$t(tkt)信息更新",
          assign: "$t(tkt)被系统分配给了{{assignee}}",
          close: "$t(tkt)关闭",
          upgrade: "$t(tkt)优先级变化为 - {{priority}}",
          resolve: "$t(tkt)被标记为已解决",
          transfer: "$t(tkt)被转交给{{assignee}}",
          makeRequest: "提出了需求",
          first_reply: "首次响应",
          category: "将该工单分类为{{category}}",
          join: "{{member}}加入了工单",
          other: "$t(other)",
        },
        info: "信息",
        assigned_to: "指派给",
        last_updated: "最后更新$t(time)",
        dateTime: "{{val, datetime}}",
      },
    },
  },
});

export default i18nBase;

export function joinTrans(keys: string[]) {
  const { i18n } = useTranslation();
  const join = i18n.language === "zh" ? "" : " ";
  return keys.join(join);
}

export { useTranslation, Trans } from "react-i18next";
