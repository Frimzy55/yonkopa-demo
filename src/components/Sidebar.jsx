// components/Sidebar.jsx
import React, { memo } from "react";

export const Sidebar = memo(
  ({
    sidebarCollapsed,
    isMobile,
    expandedMenus,
    expandedSubMenus,
    hoveredItem,
    menuItems,
    navigation,
    toggleSubMenu,
    toggleNestedMenu,
    handleMenuClick,
    handleSubMenuClick,
    handleReportClick,
    handleNestedMenuClick,
    handleMouseEnter,
    handleMouseLeave,
    getMenuItemId,
    isMainMenuActive,
    isSubMenuActive,
    isReportActive,
    isNestedActive,
    toggleSidebar,
    setMobileMenuOpen,
  }) => {
    const SidebarContent = () => (
      <>
        {/* HEADER with LOGO */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary flex-shrink-0">
          {(!sidebarCollapsed || isMobile) && (
            <div className="d-flex align-items-center">
              {/* 👇 Replace '/logo.png' with your actual logo path */}
              <img
                src="/yonko.png"
                alt="Logo"
                style={{ height: "30px", marginRight: "10px" }}
              />
              <h5 className="mb-0 text-white fw-bold">General Portal</h5>
            </div>
          )}

          {!isMobile && (
            <button
              className="btn btn-sm btn-outline-light rounded-circle sidebar-toggle"
              onClick={toggleSidebar}
            >
              <i
                className={`bi ${
                  sidebarCollapsed ? "bi-list" : "bi-chevron-left"
                }`}
              ></i>
            </button>
          )}

          {isMobile && (
            <button
              className="btn btn-sm btn-outline-light rounded-circle"
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        {/* MENU - unchanged */}
        <div
          className="flex-grow-1 overflow-auto sidebar-menu-container"
          style={{
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <ul className="nav nav-pills flex-column mb-auto mt-3 px-2">
            {menuItems.map((item) => {
              const mainItemId = getMenuItemId(item, "main");
              const isMainActive = isMainMenuActive(item);
              const isMainHovered = hoveredItem === mainItemId;

              return (
                <li key={item.name} className="nav-item mb-1">
                  {/* MAIN MENU */}
                  <button
                    id={mainItemId}
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.subMenus?.length > 0) {
                        toggleSubMenu(item.name, e);
                      }
                      handleMenuClick(item, e);
                    }}
                    onMouseEnter={() => handleMouseEnter(mainItemId)}
                    onMouseLeave={handleMouseLeave}
                    className={`menu-item nav-link w-100 text-start d-flex align-items-center ${
                      isMainActive ? "active" : ""
                    } ${isMainHovered && !isMainActive ? "hovered" : ""}`}
                    style={{ justifyContent: "space-between", gap: "8px" }}
                  >
                    <div
                      className="d-flex align-items-center"
                      style={{ gap: "8px", flex: 1 }}
                    >
                      <i className={`bi ${item.icon} menu-icon`}></i>
                      {(!sidebarCollapsed || isMobile) && (
                        <span className="menu-text">{item.name}</span>
                      )}
                    </div>
                    {item.subMenus?.length > 0 && (
                      <i
                        className={`bi ${
                          expandedMenus[item.name]
                            ? "bi-chevron-down"
                            : "bi-chevron-right"
                        } menu-arrow ${sidebarCollapsed && !isMobile ? "d-none" : ""}`}
                      ></i>
                    )}
                  </button>

                  {/* SUB MENUS */}
                  {item.subMenus?.length > 0 && expandedMenus[item.name] && (
                    <ul className="nav flex-column mt-1 submenu-container">
                      {item.subMenus.map((subItem) => {
                        const subItemId = getMenuItemId(subItem, "sub", item.name);
                        const isSubActive = isSubMenuActive(subItem);
                        const isSubHovered = hoveredItem === subItemId;

                        return (
                          <li key={subItem.name} className="nav-item">
                            <button
                              id={subItemId}
                              onClick={(e) => {
                                e.preventDefault();
                                if (
                                  subItem.reports?.length > 0 ||
                                  subItem.nestedMenus?.length > 0
                                ) {
                                  toggleNestedMenu(item.name, subItem.name, e);
                                }
                                handleSubMenuClick(item.name, subItem.name, e);
                              }}
                              onMouseEnter={() => handleMouseEnter(subItemId)}
                              onMouseLeave={handleMouseLeave}
                              className={`submenu-item nav-link w-100 text-start d-flex align-items-center ${
                                isSubActive ? "active" : ""
                              } ${isSubHovered && !isSubActive ? "hovered" : ""}`}
                              style={{ justifyContent: "space-between", gap: "8px" }}
                            >
                              <div
                                className="d-flex align-items-center"
                                style={{ gap: "8px", flex: 1 }}
                              >
                                <i className={`bi ${subItem.icon} submenu-icon`}></i>
                                <span className="submenu-text">{subItem.name}</span>
                              </div>
                              {(subItem.reports?.length > 0 ||
                                subItem.nestedMenus?.length > 0) && (
                                <i
                                  className={`bi ${
                                    expandedSubMenus[`${item.name}-${subItem.name}`]
                                      ? "bi-chevron-down"
                                      : "bi-chevron-right"
                                  } submenu-arrow`}
                                ></i>
                              )}
                            </button>

                            {/* REPORTS */}
                            {subItem.reports?.length > 0 &&
                              expandedSubMenus[`${item.name}-${subItem.name}`] && (
                                <ul className="nav flex-column mt-1 report-container">
                                  {subItem.reports.map((report) => {
                                    const reportId = getMenuItemId(
                                      report,
                                      "report",
                                      subItem.name
                                    );
                                    const isReportActiveFlag = isReportActive(report.name);
                                    const isReportHovered = hoveredItem === reportId;

                                    return (
                                      <li key={report.name} className="nav-item">
                                        <button
                                          id={reportId}
                                          onClick={(e) =>
                                            handleReportClick(
                                              subItem.reportType,
                                              report.name,
                                              e
                                            )
                                          }
                                          onMouseEnter={() => handleMouseEnter(reportId)}
                                          onMouseLeave={handleMouseLeave}
                                          className={`report-item nav-link w-100 text-start d-flex align-items-center ${
                                            isReportActiveFlag ? "active" : ""
                                          } ${
                                            isReportHovered && !isReportActiveFlag
                                              ? "hovered"
                                              : ""
                                          }`}
                                          style={{ gap: "8px" }}
                                        >
                                          <i className={`bi ${report.icon} report-icon`}></i>
                                          <span className="report-text">{report.name}</span>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}

                            {/* NESTED MENUS */}
                            {subItem.nestedMenus?.length > 0 &&
                              expandedSubMenus[`${item.name}-${subItem.name}`] && (
                                <ul className="nav flex-column mt-1 nested-container">
                                  {subItem.nestedMenus.map((nestedItem) => {
                                    const nestedId = getMenuItemId(
                                      nestedItem,
                                      "nested",
                                      subItem.name
                                    );
                                    const isNestedActiveFlag = isNestedActive(nestedItem.name);
                                    const isNestedHovered = hoveredItem === nestedId;

                                    return (
                                      <li key={nestedItem.name} className="nav-item">
                                        <button
                                          id={nestedId}
                                          onClick={(e) =>
                                            handleNestedMenuClick(
                                              item.name,
                                              subItem.name,
                                              nestedItem.name,
                                              e
                                            )
                                          }
                                          onMouseEnter={() => handleMouseEnter(nestedId)}
                                          onMouseLeave={handleMouseLeave}
                                          className={`nested-item nav-link w-100 text-start d-flex align-items-center ${
                                            isNestedActiveFlag ? "active" : ""
                                          } ${
                                            isNestedHovered && !isNestedActiveFlag
                                              ? "hovered"
                                              : ""
                                          }`}
                                          style={{ gap: "8px" }}
                                        >
                                          <i className={`bi ${nestedItem.icon} nested-icon`}></i>
                                          <span className="nested-text">{nestedItem.name}</span>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* FOOTER - unchanged */}
        <div className="border-top border-secondary p-3 flex-shrink-0">
          {!sidebarCollapsed || isMobile ? (
            <div className="small text-white-50">
              <i className="bi bi-building me-1"></i>
              v2.0.0
            </div>
          ) : (
            <div className="text-center text-white-50 small">
              <i className="bi bi-building"></i>
            </div>
          )}
        </div>
      </>
    );

    return <SidebarContent />;
  }
);

Sidebar.displayName = "Sidebar";