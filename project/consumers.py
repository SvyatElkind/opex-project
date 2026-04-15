from channels.generic.websocket import AsyncJsonWebsocketConsumer

from project.helpers.constants import OPEX_PROGRESS_GROUP_NAME


class OPEXProgressConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            OPEX_PROGRESS_GROUP_NAME,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            OPEX_PROGRESS_GROUP_NAME,
            self.channel_name
        )

    # Called when group_send sends a message with type 'progress'
    async def progress(self, event):
        await self.send_json(event['data'])