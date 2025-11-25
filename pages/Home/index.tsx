import React from 'react';
import Hero from './components/Hero';
import ModelList from './components/ModelList';
import StatsRow from './components/StatsRow';
import HomeFooter from './components/HomeFooter';
import { useAppOutletContext } from '../../router/context';
import { CURRENT_SYSTEM, SYSTEM_TYPE } from '../../constants';
import CreateHome from '../Create/CreateHome';

const Home: React.FC = () => {
  const { t } = useAppOutletContext();
  
  return (
    <>
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
    </>
  );
};

export default Home;
