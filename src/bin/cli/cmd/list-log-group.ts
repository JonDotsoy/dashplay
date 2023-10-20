import { AppContext } from "../../../app/app-context";
import { ConsoleRender } from "../../../common/console-render";
import { LogGroup } from "../../../logs/logs-group";

export default async (ctx: AppContext, args: string[]) => {
  const res = await LogGroup.listLogGroups(ctx)

  new ConsoleRender(ctx, {
    table: {
      columns: {
        'ID': obj => obj.id,
        'NAME': obj => obj.name,
        'CREATED AT': obj => new Date(obj.createdAt).toLocaleString(),
      }
    }
  }).render(res)
}
