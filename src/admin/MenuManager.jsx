import React, { useState } from 'react';
import { menuItems } from './permissions';

const MenuManager = () => {
  const [expandedMenus, setExpandedMenus] = useState({});
  const [expandedSubMenus, setExpandedSubMenus] = useState({});
  const [expandedNestedMenus, setExpandedNestedMenus] = useState({});

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const toggleSubMenu = (menuName, subMenuName) => {
    const key = `${menuName}_${subMenuName}`;
    setExpandedSubMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleNestedMenu = (menuName, subMenuName, nestedName) => {
    const key = `${menuName}_${subMenuName}_${nestedName}`;
    setExpandedNestedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderReports = (reports, menuName, subMenuName) => {
    if (!reports || reports.length === 0) return null;
    
    return (
      <ul className="list-unstyled ms-4 mt-2">
        {reports.map((report, idx) => (
          <li key={idx} className="mb-1">
            <div className="d-flex align-items-center p-1 rounded hover-bg">
              <i className={`${report.icon} me-2 text-success`}></i>
              <span className="small">{report.name}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderNestedMenus = (nestedMenus, menuName, subMenuName) => {
    if (!nestedMenus || nestedMenus.length === 0) return null;
    
    return (
      <ul className="list-unstyled ms-4 mt-2">
        {nestedMenus.map((nested, idx) => {
          const nestedKey = `${menuName}_${subMenuName}_${nested.name}`;
          const hasNestedChildren = nested.nestedMenus && nested.nestedMenus.length > 0;
          const hasReports = nested.reports && nested.reports.length > 0;
          
          return (
            <li key={idx} className="mb-2">
              {hasNestedChildren || hasReports ? (
                <>
                  <div 
                    className="d-flex align-items-center p-2 rounded hover-bg cursor-pointer"
                    onClick={() => toggleNestedMenu(menuName, subMenuName, nested.name)}
                    style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                  >
                    <i className={`bi ${expandedNestedMenus[nestedKey] ? 'bi-chevron-down' : 'bi-chevron-right'} me-2 text-info`}></i>
                    <i className={`${nested.icon} me-2 text-primary`}></i>
                    <span className="fw-semibold">{nested.name}</span>
                  </div>
                  {expandedNestedMenus[nestedKey] && (
                    <>
                      {hasNestedChildren && renderNestedMenus(nested.nestedMenus, menuName, `${subMenuName}_${nested.name}`)}
                      {hasReports && renderReports(nested.reports, menuName, `${subMenuName}_${nested.name}`)}
                    </>
                  )}
                </>
              ) : (
                <div className="d-flex align-items-center p-2 rounded hover-bg ms-3">
                  <i className={`${nested.icon} me-2 text-secondary`}></i>
                  <span>{nested.name}</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderSubMenus = (subMenus, menuName) => {
    if (!subMenus || subMenus.length === 0) return null;
    
    return (
      <ul className="list-unstyled mt-2 ms-4">
        {subMenus.map((subMenu, idx) => {
          const subMenuKey = `${menuName}_${subMenu.name}`;
          const hasNested = subMenu.nestedMenus && subMenu.nestedMenus.length > 0;
          const hasReports = subMenu.reports && subMenu.reports.length > 0;
          const hasContent = hasNested || hasReports;
          
          return (
            <li key={idx} className="mb-2">
              {hasContent ? (
                <>
                  <div 
                    className="d-flex align-items-center p-2 rounded hover-bg cursor-pointer"
                    onClick={() => toggleSubMenu(menuName, subMenu.name)}
                    style={{ cursor: 'pointer', backgroundColor: '#e9ecef' }}
                  >
                    <i className={`bi ${expandedSubMenus[subMenuKey] ? 'bi-chevron-down' : 'bi-chevron-right'} me-2 text-info`}></i>
                    <i className={`${subMenu.icon} me-2 text-primary`}></i>
                    <span className="fw-semibold">{subMenu.name}</span>
                  </div>
                  {expandedSubMenus[subMenuKey] && (
                    <div className="mt-2">
                      {hasNested && renderNestedMenus(subMenu.nestedMenus, menuName, subMenu.name)}
                      {hasReports && renderReports(subMenu.reports, menuName, subMenu.name)}
                    </div>
                  )}
                </>
              ) : (
                <div className="d-flex align-items-center p-2 rounded hover-bg">
                  <i className={`${subMenu.icon} me-2 text-secondary`}></i>
                  <span>{subMenu.name}</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">
            <i className="bi bi-menu-button-wide me-2"></i>
            System Menu Structure
          </h4>
          <p className="mb-0 small mt-1">Click on any blue heading to expand/collapse menu items</p>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-12">
              <div className="menu-tree">
                {menuItems.map((menu, idx) => (
                  <div key={idx} className="mb-3 border rounded">
                    {/* Main Menu Heading - Click to toggle */}
                    <div 
                      className="d-flex justify-content-between align-items-center p-3 bg-primary bg-opacity-10 rounded-top cursor-pointer"
                      onClick={() => toggleMenu(menu.name)}
                      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    >
                      <div className="d-flex align-items-center">
                        <i className={`bi ${expandedMenus[menu.name] ? 'bi-chevron-down' : 'bi-chevron-right'} me-3 text-primary fs-5`}></i>
                        <i className={`${menu.icon} me-3 text-primary fs-4`}></i>
                        <h5 className="mb-0 text-primary">{menu.name}</h5>
                      </div>
                      <div className="d-flex align-items-center">
                        {menu.subMenus && menu.subMenus.length > 0 && (
                          <span className="badge bg-primary me-2">
                            {menu.subMenus.length} items
                          </span>
                        )}
                        <i className={`bi ${expandedMenus[menu.name] ? 'bi-chevron-up' : 'bi-chevron-down'} text-primary`}></i>
                      </div>
                    </div>
                    
                    {/* Sub Menus - Show when expanded */}
                    {expandedMenus[menu.name] && (
                      <div className="p-3 border-top">
                        {menu.subMenus && menu.subMenus.length > 0 ? (
                          renderSubMenus(menu.subMenus, menu.name)
                        ) : (
                          <div className="text-muted text-center py-3">
                            <i className="bi bi-info-circle me-2"></i>
                            No sub-menus available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .cursor-pointer {
            cursor: pointer;
          }
          .hover-bg:hover {
            background-color: #f8f9fa !important;
          }
          .menu-tree {
            max-height: 600px;
            overflow-y: auto;
          }
          .menu-tree::-webkit-scrollbar {
            width: 8px;
          }
          .menu-tree::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .menu-tree::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          .menu-tree::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>
    </div>
  );
};

export default MenuManager;