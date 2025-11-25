import React from 'react';
import Hero from './components/Hero';
import ModelList from './components/ModelList';
import StatsRow from './components/StatsRow';
import HomeFooter from './components/HomeFooter';
import AnnouncementModal from '../../components/AnnouncementModal';
import { useAppOutletContext } from '../../router/context';
import { CURRENT_SYSTEM, SYSTEM_TYPE } from '../../constants';
import CreateHome from '../Create/CreateHome';

const Home: React.FC = () => {
  const { t } = useAppOutletContext();
  
  return (
    <>
      {/* 新版本公告弹窗 */}
      <AnnouncementModal />

      {/* 当系统为Both的时候，显示CreateHome，不显示Hero和下面的ModelList、StatsRow、HomeFooter*/}
      {CURRENT_SYSTEM === SYSTEM_TYPE.BOTH && (
        <CreateHome />
      )}
      {CURRENT_SYSTEM !== SYSTEM_TYPE.BOTH && (
        <>
          <Hero t={t.hero} />
          <StatsRow />
          <div id="trending-models" className="relative z-10 -mt-8">
            <ModelList t={t.modelList} />
          </div>
          {/* <HomeFooter /> */}
        </>
      )}
         {/* 分割线 显示备案信息 */}
         <div className="border-t border-border"></div>
          <div className="text-center text-[10px] text-muted">
            <p>备案号：粤ICP备2022093288号-4</p>
            <p>Copyright © 2025 Nebula Data (HK) Limited</p>
          </div>
    </>
  );
};

export default Home;
