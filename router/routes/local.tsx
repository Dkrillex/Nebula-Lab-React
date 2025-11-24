import React from 'react';
import { AppRouteObject } from '../AuthGuard';
import DashboardLayout from '../../components/DashboardLayout';
import { RouteWrapper } from '../../pages/Create/RouteWrapper';

// 懒加载组件
const CreateLayout = React.lazy(() => import('../../pages/Create'));
const CreateHome = React.lazy(() => import('../../pages/Create/CreateHome'));
const AssetsPage = React.lazy(() => import('../../pages/Assets'));
const ChatPage = React.lazy(() => import('../../pages/Chat'));
const KeysPage = React.lazy(() => import('../../pages/Keys'));
const ModelSquarePage = React.lazy(() => import('../../pages/Models'));
const ExpensesPage = React.lazy(() => import('../../pages/Expenses'));
const PricingPage = React.lazy(() => import('../../pages/Pricing'));
const PriceListPage = React.lazy(() => import('../../pages/PriceList'));
const RankPage = React.lazy(() => import('../../pages/Rank'));
const ProfilePage = React.lazy(() => import('../../pages/Profile'));

// Create Page Sub-components
const TextToImagePage = React.lazy(() => import('../../pages/Create/components/TextToImagePage'));
const ViralVideoPage = React.lazy(() => import('../../pages/Create/components/ViralVideoPage'));
const ImageToVideoPage = React.lazy(() => import('../../pages/Create/components/ImageToVideoPage'));
const DigitalHumanPage = React.lazy(() => import('../../pages/Create/components/DigitalHumanPage'));
const StyleTransferPage = React.lazy(() => import('../../pages/Create/components/StyleTransferPage'));
const VoiceClone = React.lazy(() => import('../../pages/Create/components/VoiceClone'));
const ThreeDModelPage = React.lazy(() => import('../../pages/Create/components/ThreeDModelPage'));
const GlbViewerPage = React.lazy(() => import('../../pages/Create/components/GlbViewerPage'));
const AiFaceSwapPage = React.lazy(() => import('../../pages/Create/components/AiFaceSwapPage'));
const TtsPage = React.lazy(() => import('../../pages/Create/components/TtsPage'));
const UseToolPage = React.lazy(() => import('../../pages/Create/components/UseToolPage'));
const AIFaceSwappingPage = React.lazy(() => import('../../pages/Create/components/AIFaceSwappingPage'));
const TemplateUiPage = React.lazy(() => import('../../pages/Create/components/TemplateUiPage'));
const WorkshopPage = React.lazy(() => import('../../pages/Create/components/WorkshopPage'));

// Wrapper components defined inline or imported if complex logic needed
// For now, we assume components can handle their own data fetching or use hooks

export const localRoutes: AppRouteObject[] = [
  {
    element: <DashboardLayout />,
    children: [
      {
        path: 'create',
        element: <CreateLayout />,
        meta: {
          title: 'Create',
          icon: 'magic',
          requiresAuth: true
          // keepAlive: true // Disable caching for layout to allow children to handle their own caching
        },
        children: [
          {
            index: true,
            element: <CreateHome />,
            meta: {
              title: 'Create Dashboard',
              keepAlive: true
            }
          },
          {
            path: 'textToImage',
            element: <RouteWrapper component={TextToImagePage} translationKey="textToImage" />,
            meta: { title: 'Text to Image', keepAlive: true }
          },
          {
            path: 'viralVideo',
            element: <RouteWrapper component={ViralVideoPage} translationKey="viralVideo" />,
            meta: { title: 'Viral Video', keepAlive: true }
          },
          {
            path: 'imgToVideo',
            element: <RouteWrapper component={ImageToVideoPage} translationKey="imgToVideo" />,
            meta: { title: 'Image to Video', keepAlive: true }
          },
          {
            path: 'digitalHuman',
            element: <RouteWrapper 
              component={DigitalHumanPage} 
              mapContextToProps={(t) => ({ 
                t: t?.createPage?.digitalHuman,
                productAvatarT: t?.createPage?.productAvatar 
              })} 
            />,
            meta: { title: 'Digital Human', keepAlive: true }
          },
          {
            path: 'styleTransfer',
            element: <RouteWrapper component={StyleTransferPage} translationKey="styleTransfer" />,
            meta: { title: 'Style Transfer', keepAlive: true }
          },
          {
            path: 'voiceClone',
            element: <RouteWrapper component={VoiceClone} />,
            meta: { title: 'Voice Clone', keepAlive: true }
          },
          {
            path: '3dModel',
            element: <RouteWrapper component={ThreeDModelPage} />,
            meta: { title: '3D Model', keepAlive: true }
          },
          {
            path: 'glbViewer',
            element: <RouteWrapper component={GlbViewerPage} />,
            meta: { title: 'GLB Viewer', keepAlive: true }
          },
          {
            path: 'aiFaceSwap',
            element: <RouteWrapper component={AiFaceSwapPage} />,
            meta: { title: 'Face Swap', keepAlive: true }
          },
          {
            path: 'tts',
            element: <RouteWrapper component={TtsPage} />,
            meta: { title: 'TTS', keepAlive: true }
          },
          {
            path: 'useTool',
            element: <RouteWrapper component={UseToolPage} />,
            meta: { title: 'Use Tool', keepAlive: true }
          },
          {
            path: 'imageTranslation',
            element: <RouteWrapper component={AIFaceSwappingPage} />,
            meta: { title: 'Image Translation', keepAlive: true }
          },
          {
            path: 'templateUi',
            element: <RouteWrapper component={TemplateUiPage} />,
            meta: { title: 'Template UI', keepAlive: true }
          },
          {
            path: 'workshop',
            element: <RouteWrapper component={WorkshopPage} translationKey="workshop" />,
            meta: { title: 'Workshop', keepAlive: true }
          }
        ]
      },
      {
        path: 'assets',
        element: <AssetsPage />,
        meta: {
          title: 'Assets',
          icon: 'folder',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'chat',
        element: <ChatPage />,
        meta: {
          title: 'Chat',
          icon: 'message',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'keys',
        element: <KeysPage />,
        meta: {
          title: 'Keys',
          icon: 'key',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'models',
        element: <ModelSquarePage />,
        meta: {
          title: 'Models',
          icon: 'grid',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'expenses',
        element: <ExpensesPage />,
        meta: {
          title: 'Expenses',
          icon: 'dollar-sign',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'pricing',
        element: <PricingPage />,
        meta: {
          title: 'Pricing',
          icon: 'credit-card',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'price-list',
        element: <PriceListPage />,
        meta: {
          title: 'Price List',
          icon: 'list',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'rank',
        element: <RankPage />,
        meta: {
          title: 'Leaderboard',
          icon: 'trophy',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'profile',
        element: <ProfilePage />,
        meta: {
          title: 'Profile',
          icon: 'user',
          requiresAuth: true,
          keepAlive: true
        }
      }
    ]
  }
];
