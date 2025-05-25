"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const calls_service_1 = require("./calls.service");
const calls_controller_1 = require("./calls.controller");
const turn_controller_1 = require("./turn.controller");
const calls_gateway_1 = require("./calls.gateway");
const call_schema_1 = require("./schemas/call.schema");
const users_module_1 = require("../users/users.module");
const notifications_module_1 = require("../notifications/notifications.module");
const turn_service_1 = require("../common/services/turn.service");
let CallsModule = class CallsModule {
};
exports.CallsModule = CallsModule;
exports.CallsModule = CallsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: call_schema_1.Call.name, schema: call_schema_1.CallSchema }]),
            users_module_1.UsersModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [calls_controller_1.CallsController, turn_controller_1.TurnController],
        providers: [calls_service_1.CallsService, calls_gateway_1.CallsGateway, turn_service_1.TurnService],
        exports: [calls_service_1.CallsService, calls_gateway_1.CallsGateway, turn_service_1.TurnService],
    })
], CallsModule);
//# sourceMappingURL=calls.module.js.map