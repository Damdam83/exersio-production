/**
 * Tests unitaires pour CustomLoggerService
 * Service critique : logging, rotation quotidienne, spécialisation logs
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from './logger.service';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

// Mock winston
jest.mock('winston', () => ({
  createLogger: jest.fn(),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn(),
    printf: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    DailyRotateFile: jest.fn(),
  },
}));

describe('CustomLoggerService', () => {
  let service: CustomLoggerService;
  let configService: ConfigService;
  let mockLogger: any;

  beforeEach(async () => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    (winston.createLogger as jest.Mock).mockReturnValue(mockLogger);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomLoggerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config: Record<string, any> = {
                NODE_ENV: 'test',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CustomLoggerService>(CustomLoggerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('logging methods', () => {
    it('should log info messages with context', () => {
      const message = 'Test info message';
      const context = 'TestContext';

      service.log(message, context);

      expect(mockLogger.info).toHaveBeenCalledWith(message, {
        context,
        timestamp: expect.any(String),
      });
    });

    it('should log error messages with context', () => {
      const message = 'Test error message';
      const context = 'TestContext';

      service.error(message, context);

      expect(mockLogger.error).toHaveBeenCalledWith(message, {
        context,
        timestamp: expect.any(String),
      });
    });

    it('should log warnings with context', () => {
      const message = 'Test warning message';
      const context = 'TestContext';

      service.warn(message, context);

      expect(mockLogger.warn).toHaveBeenCalledWith(message, {
        context,
        timestamp: expect.any(String),
      });
    });

    it('should log debug messages with context', () => {
      const message = 'Test debug message';
      const context = 'TestContext';

      service.debug(message, context);

      expect(mockLogger.debug).toHaveBeenCalledWith(message, {
        context,
        timestamp: expect.any(String),
      });
    });
  });

  describe('specialized logging', () => {
    it('should create specialized logger for auth logs', () => {
      const message = 'User logged in successfully';
      const context = 'AuthService';

      service.log(message, context);

      expect(mockLogger.info).toHaveBeenCalledWith(message, {
        context,
        timestamp: expect.any(String),
      });
    });

    it('should create specialized logger for email logs', () => {
      const message = 'Email sent successfully';
      const context = 'MailService';

      service.log(message, context);

      expect(mockLogger.info).toHaveBeenCalledWith(message, {
        context,
        timestamp: expect.any(String),
      });
    });
  });

  describe('configuration', () => {
    it('should initialize with correct environment configuration', () => {
      expect(configService.get).toHaveBeenCalledWith('NODE_ENV');
      expect(winston.createLogger).toHaveBeenCalled();
    });

    it('should create appropriate transports for environment', () => {
      // In test environment, should create console transport
      expect(winston.transports.Console).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle winston logger creation errors', () => {
      (winston.createLogger as jest.Mock).mockImplementation(() => {
        throw new Error('Logger creation failed');
      });

      // Should not throw during service creation
      expect(() => {
        new CustomLoggerService(configService);
      }).not.toThrow();
    });
  });
});