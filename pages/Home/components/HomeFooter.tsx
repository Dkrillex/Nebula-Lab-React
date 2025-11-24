import React from 'react';
import './HomeFooter.css';

const HomeFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-4 text-sm">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {/* 隐私协议 - 直接跳转 */}
            <a 
              href="/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              隐私协议
            </a>
            
            <span className="text-gray-600 hidden md:inline">|</span>
            
            {/* 备案信息 - Tooltip 显示 */}
            <div className="custom-tooltip">
              <p className="tooltip-trigger text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer">
                备案信息
              </p>
              <div className="tooltip-content tooltip-content-record">
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icp-link"
                >
                  粤ICP备2022093288号-4
                </a>
                <p>Copyright © 2025</p>
                <p>星雲數據(香港)有限公司</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
