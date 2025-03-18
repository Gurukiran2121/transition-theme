// src/App.tsx
import React, { useState } from "react";
import {
  Layout,
  Typography,
  Space,
  Card,
  Button,
  Select,
  Slider,
  Switch,
  Divider,
  Row,
  Col,
  Alert,
  Flex,
  ConfigProvider,
  theme,
} from "antd";
import {
  BulbOutlined,
  SwapOutlined,
  InfoCircleOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import {
  useThemeTransition,
  ThemeAnimationType,
  SlideDirection,
} from "./hook/useThemeTransition.ts";

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const codeExample = `
import { useThemeTransition, ThemeAnimationType } from './hooks/useThemeTransition';

function ThemeToggle() {
  const { ref, toggleTheme, isDarkMode } = useThemeTransition({
    animationType: ThemeAnimationType.BLUR_CIRCLE,
    duration: 500,
    respectSystemPreference: true
  });

  return (
    <button ref={ref} onClick={toggleTheme}>
      {isDarkMode ? '🌙' : '☀️'}
    </button>
  );
}
`;

const App: React.FC = () => {
  // Configuration state
  const [animationType, setAnimationType] = useState<ThemeAnimationType>(
    ThemeAnimationType.CIRCLE
  );
  const [duration, setDuration] = useState<number>(750);
  const [easing, setEasing] = useState<string>("cubic-bezier(0.4, 0, 0.2, 1)");
  const [blurAmount, setBlurAmount] = useState<number>(2);
  const [respectSystemPreference, setRespectSystemPreference] =
    useState<boolean>(true);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>(
    SlideDirection.RIGHT
  );

  // Use the theme transition hook with the configuration
  const {
    ref: toggleRTef,
    toggleTheme,
    setTheme,
    isDarkMode,
    isTransitioning,
  } = useThemeTransition({
    animationType,
    duration,
    easing,
    blurAmount,
    respectSystemPreference,
    slideDirection,
  });

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <Layout
        className={isDarkMode ? "dark" : ""}
        style={{ minHeight: "100vh", padding: "1rem" }}
      >
        <Flex align="center" justify="space-between">
          <Title level={3} style={{ margin: 0 }}>
            Theme Transition Hook Demo
          </Title>
          <Space ref={toggleRTef}>
            <Button
              type="text"
              icon={isDarkMode ? <BulbOutlined /> : <BulbOutlined />}
              onClick={toggleTheme}
              size="large"
              disabled={isTransitioning}
            >
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </Button>
          </Space>
        </Flex>

        <Content style={{ padding: "0 50px", marginTop: 64 }}>
          <Space
            direction="vertical"
            size="large"
            style={{ width: "100%", padding: "24px 0" }}
          >
            <Card title="Theme Transition Controls" bordered={false}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Title level={5}>Animation Type</Title>
                    <Select
                      style={{ width: "100%" }}
                      value={animationType}
                      onChange={setAnimationType}
                      disabled={isTransitioning}
                    >
                      <Option value={ThemeAnimationType.CIRCLE}>Circle</Option>
                      <Option value={ThemeAnimationType.BLUR_CIRCLE}>
                        Blur Circle
                      </Option>
                      <Option value={ThemeAnimationType.FADE}>Fade</Option>
                      <Option value={ThemeAnimationType.SLIDE}>Slide</Option>
                      <Option value={ThemeAnimationType.NONE}>None</Option>
                    </Select>
                  </Col>
                  <Col span={12}>
                    <Title level={5}>Duration (ms)</Title>
                    <Slider
                      min={200}
                      max={2000}
                      step={50}
                      value={duration}
                      onChange={setDuration}
                      disabled={isTransitioning}
                    />
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Title level={5}>Easing Function</Title>
                    <Select
                      style={{ width: "100%" }}
                      value={easing}
                      onChange={setEasing}
                      disabled={isTransitioning}
                    >
                      <Option value="cubic-bezier(0.4, 0, 0.2, 1)">
                        Ease (Material)
                      </Option>
                      <Option value="ease-in-out">Ease In Out</Option>
                      <Option value="ease-in">Ease In</Option>
                      <Option value="ease-out">Ease Out</Option>
                      <Option value="linear">Linear</Option>
                    </Select>
                  </Col>
                  <Col span={12}>
                    {animationType === ThemeAnimationType.BLUR_CIRCLE && (
                      <>
                        <Title level={5}>Blur Amount</Title>
                        <Slider
                          min={0}
                          max={10}
                          step={0.5}
                          value={blurAmount}
                          onChange={setBlurAmount}
                          disabled={isTransitioning}
                        />
                      </>
                    )}
                    {animationType === ThemeAnimationType.SLIDE && (
                      <>
                        <Title level={5}>Slide Direction</Title>
                        <Select
                          style={{ width: "100%" }}
                          value={slideDirection}
                          onChange={setSlideDirection}
                          disabled={isTransitioning}
                        >
                          <Option value={SlideDirection.RIGHT}>Right</Option>
                          <Option value={SlideDirection.LEFT}>Left</Option>
                          <Option value={SlideDirection.UP}>Up</Option>
                          <Option value={SlideDirection.DOWN}>Down</Option>
                        </Select>
                      </>
                    )}
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Title level={5}>System Preference</Title>
                    <Space>
                      <Switch
                        checked={respectSystemPreference}
                        onChange={setRespectSystemPreference}
                        disabled={isTransitioning}
                      />
                      <Text>Respect system color scheme preference</Text>
                    </Space>
                  </Col>
                  {/* <Col span={12}>
                    <Title level={5}>Theme Control</Title>
                    <Space>
                      <Button onClick={() => setTheme(true)}>
                        Set Dark Mode
                      </Button>
                      <Button onClick={() => setTheme(false)}>
                        Set Light Mode
                      </Button>
                      <Button icon={<SwapOutlined />} onClick={toggleTheme}>
                        Toggle Theme
                      </Button>
                    </Space>
                  </Col> */}
                </Row>
              </Space>
            </Card>

            <Card
              title="Usage Example"
              bordered={false}
              extra={<CodeOutlined />}
            >
              <pre
                style={{
                  padding: 16,
                  borderRadius: 4,
                  overflowX: "auto",
                }}
              >
                <code>{codeExample}</code>
              </pre>
              <Divider />
              <Alert
                message="Browser Compatibility"
                description="The animation requires the View Transitions API, which is currently supported in Chrome 111+ and Safari 16.4+. In unsupported browsers, the theme will still change but without animation."
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
              />
            </Card>

            <Card title="Implementation Details" bordered={false}>
              <Paragraph>
                <Text strong>Why use this hook?</Text>
              </Paragraph>
              <ul>
                <li>Smooth, customizable theme transitions</li>
                <li>Respects user's system preferences</li>
                <li>Falls back gracefully in unsupported browsers</li>
                <li>Respects reduced motion preferences</li>
                <li>Multiple animation types for different visual effects</li>
                <li>Simple API with TypeScript support</li>
              </ul>

              <Paragraph>
                <Text strong>How it works:</Text>
              </Paragraph>
              <Paragraph>
                This hook uses the View Transitions API to create smooth
                animations when switching between themes. It dynamically
                generates CSS animations based on the selected options and
                applies them during the transition. The hook also handles theme
                persistence in localStorage and can respect the user's system
                color scheme preference.
              </Paragraph>
            </Card>
          </Space>
        </Content>

        <Footer style={{ textAlign: "center" }}>
          Theme Transition Hook Demo ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
