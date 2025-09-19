/**
 * 网站连通性检测服务
 * 由于浏览器CORS限制，使用多种方法检测网站连通性
 */

export interface ConnectivityResult {
  status: 'online' | 'offline' | 'error' | 'timeout' | 'checking';
  statusCode?: number;
  responseTime?: number;
  error?: string;
  method: 'fetch' | 'image' | 'iframe' | 'ping';
}

export class ConnectivityService {
  private static readonly TIMEOUT = 10000; // 10秒超时
  private static readonly CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'; // 备用CORS代理

  /**
   * 检测网站连通性
   * @param url 要检测的网站URL
   * @returns 连通性检测结果
   */
  static async checkConnectivity(url: string): Promise<ConnectivityResult> {
    const startTime = Date.now();
    
    try {
      // 方法1: 尝试直接fetch（可能被CORS阻止）
      const fetchResult = await this.checkWithFetch(url);
      if (fetchResult.status !== 'error') {
        return {
          ...fetchResult,
          responseTime: Date.now() - startTime
        };
      }

      // 方法2: 使用Image标签检测（适用于有图片资源的网站）
      const imageResult = await this.checkWithImage(url);
      if (imageResult.status !== 'error') {
        return {
          ...imageResult,
          responseTime: Date.now() - startTime
        };
      }

      // 方法3: 使用iframe检测（可能被X-Frame-Options阻止）
      const iframeResult = await this.checkWithIframe(url);
      return {
        ...iframeResult,
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : '未知错误',
        method: 'fetch',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * 使用fetch API检测
   */
  private static async checkWithFetch(url: string): Promise<ConnectivityResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(url, {
        method: 'HEAD', // 使用HEAD请求减少数据传输
        mode: 'no-cors', // 避免CORS错误
        signal: controller.signal,
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);

      // no-cors模式下，response.status总是0，但如果请求成功说明网站可访问
      if (response.type === 'opaque') {
        return {
          status: 'online',
          method: 'fetch'
        };
      }

      return {
        status: response.ok ? 'online' : 'error',
        statusCode: response.status,
        method: 'fetch'
      };

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            status: 'timeout',
            error: '请求超时',
            method: 'fetch'
          };
        }
        
        // 网络错误通常意味着网站不可访问
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          return {
            status: 'offline',
            error: '网站无法访问',
            method: 'fetch'
          };
        }
      }

      return {
        status: 'error',
        error: error instanceof Error ? error.message : '检测失败',
        method: 'fetch'
      };
    }
  }

  /**
   * 使用Image标签检测（检测favicon或首页）
   */
  private static async checkWithImage(url: string): Promise<ConnectivityResult> {
    return new Promise((resolve) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        resolve({
          status: 'timeout',
          error: '图片加载超时',
          method: 'image'
        });
      }, this.TIMEOUT);

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve({
          status: 'online',
          method: 'image'
        });
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        // 尝试加载favicon
        const faviconImg = new Image();
        const faviconUrl = new URL('/favicon.ico', url).href;
        
        faviconImg.onload = () => {
          resolve({
            status: 'online',
            method: 'image'
          });
        };

        faviconImg.onerror = () => {
          resolve({
            status: 'offline',
            error: '无法加载网站资源',
            method: 'image'
          });
        };

        faviconImg.src = faviconUrl;
      };

      // 尝试加载网站首页（作为图片）
      img.src = url;
    });
  }

  /**
   * 使用iframe检测
   */
  private static async checkWithIframe(url: string): Promise<ConnectivityResult> {
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '1px';
      iframe.style.height = '1px';

      const timeoutId = setTimeout(() => {
        document.body.removeChild(iframe);
        resolve({
          status: 'timeout',
          error: 'iframe加载超时',
          method: 'iframe'
        });
      }, this.TIMEOUT);

      iframe.onload = () => {
        clearTimeout(timeoutId);
        document.body.removeChild(iframe);
        resolve({
          status: 'online',
          method: 'iframe'
        });
      };

      iframe.onerror = () => {
        clearTimeout(timeoutId);
        document.body.removeChild(iframe);
        resolve({
          status: 'offline',
          error: '网站拒绝iframe访问',
          method: 'iframe'
        });
      };

      document.body.appendChild(iframe);
      iframe.src = url;
    });
  }

  /**
   * 获取状态显示文本
   */
  static getStatusText(result: ConnectivityResult): string {
    switch (result.status) {
      case 'online':
        return '网站正常';
      case 'offline':
        return '网站离线';
      case 'error':
        return '检测异常';
      case 'timeout':
        return '连接超时';
      case 'checking':
        return '检测中...';
      default:
        return '未知状态';
    }
  }

  /**
   * 获取状态颜色
   */
  static getStatusColor(result: ConnectivityResult): string {
    switch (result.status) {
      case 'online':
        return 'text-green-600';
      case 'offline':
        return 'text-red-600';
      case 'error':
        return 'text-orange-600';
      case 'timeout':
        return 'text-yellow-600';
      case 'checking':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * 获取状态图标
   */
  static getStatusIcon(result: ConnectivityResult): string {
    switch (result.status) {
      case 'online':
        return '🟢';
      case 'offline':
        return '🔴';
      case 'error':
        return '🟠';
      case 'timeout':
        return '🟡';
      case 'checking':
        return '🔵';
      default:
        return '⚪';
    }
  }
}
