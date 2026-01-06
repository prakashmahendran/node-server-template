import { expect } from 'chai';
import sinon from 'sinon';
import { createMockRequest, createMockResponse } from 'test/stubs';
import { PubSub } from 'node-server-engine';
import { publishTestHandler } from './publishTest.handler';
import {
  PUBSUB_DISABLED,
  PUBSUB_NOT_CONFIGURED,
  PUBSUB_PUBLISH_SUCCESS,
  PUBSUB_PUBLISH_ERROR
} from './publishTest.const';
import { publishTestValidator } from './publishTest.validator';

describe('Pub/Sub Endpoints', () => {
  describe('Pub/Sub Constants', () => {
    it('should have correct message constants', () => {
      expect(PUBSUB_DISABLED).to.equal('Pub/Sub is not enabled');
      expect(PUBSUB_NOT_CONFIGURED).to.equal('PUBSUB_TOPIC not configured');
      expect(PUBSUB_PUBLISH_SUCCESS).to.equal('Message published to Pub/Sub');
      expect(PUBSUB_PUBLISH_ERROR).to.equal('Failed to publish message');
    });
  });

  describe('Pub/Sub Validators', () => {
    it('should validate message field correctly', () => {
      expect(publishTestValidator.message).to.exist;
      expect(publishTestValidator.message.in).to.equal('body');
      expect(publishTestValidator.message.isString).to.exist;
      expect(publishTestValidator.message.notEmpty).to.exist;
    });

    it('should validate data field as optional', () => {
      expect(publishTestValidator.data).to.exist;
      expect(publishTestValidator.data.optional).to.be.true;
      expect(publishTestValidator.data.isObject).to.exist;
    });
  });

  describe('Pub/Sub Handlers', () => {
    let req: any;
    let res: any;
    let publishStub: sinon.SinonStub;
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      req = createMockRequest({
        body: {
          message: 'Test message',
          data: { key: 'value' }
        }
      });
      res = createMockResponse();
      originalEnv = { ...process.env };
      publishStub = sinon.stub(PubSub, 'publish');
    });

    afterEach(() => {
      sinon.restore();
      process.env = originalEnv;
    });

    describe('publishTestHandler', () => {
      it('should return error when Pub/Sub is disabled', async () => {
        process.env.ENABLE_PUBSUB = 'false';

        await publishTestHandler(req, res);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
          success: false,
          message: PUBSUB_DISABLED
        });
      });

      it('should return error when PUBSUB_TOPIC is not configured', async () => {
        process.env.ENABLE_PUBSUB = 'true';
        delete process.env.PUBSUB_TOPIC;

        await publishTestHandler(req, res);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
          success: false,
          message: PUBSUB_NOT_CONFIGURED
        });
      });

      it('should successfully publish message', async () => {
        process.env.ENABLE_PUBSUB = 'true';
        process.env.PUBSUB_TOPIC = 'test-topic';
        process.env.CHART = 'test-service';

        publishStub.resolves();

        await publishTestHandler(req, res);

        expect(publishStub).to.have.been.calledOnce;
        expect(publishStub.firstCall.args[0]).to.equal('test-topic');
        expect(publishStub.firstCall.args[1]).to.deep.include({
          message: 'Test message',
          data: { key: 'value' },
          service: 'test-service'
        });
        expect(res.json).to.have.been.calledWith(
          sinon.match({
            success: true,
            message: PUBSUB_PUBLISH_SUCCESS
          })
        );
      });

      it('should handle publish errors', async () => {
        process.env.ENABLE_PUBSUB = 'true';
        process.env.PUBSUB_TOPIC = 'test-topic';

        const error = new Error('Connection failed');
        publishStub.rejects(error);

        await publishTestHandler(req, res);

        expect(res.status).to.have.been.calledWith(500);
        expect(res.json).to.have.been.calledWith({
          success: false,
          message: PUBSUB_PUBLISH_ERROR,
          error: 'Connection failed'
        });
      });

      it('should use default service name when CHART is not set', async () => {
        process.env.ENABLE_PUBSUB = 'true';
        process.env.PUBSUB_TOPIC = 'test-topic';
        delete process.env.CHART;

        publishStub.resolves();

        await publishTestHandler(req, res);

        expect(publishStub.firstCall.args[1].service).to.equal('unknown');
      });

      it('should handle missing data field', async () => {
        process.env.ENABLE_PUBSUB = 'true';
        process.env.PUBSUB_TOPIC = 'test-topic';

        req.body.data = undefined;
        publishStub.resolves();

        await publishTestHandler(req, res);

        expect(publishStub.firstCall.args[1].data).to.deep.equal({});
      });
    });
  });
});
