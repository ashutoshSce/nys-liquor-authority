import ResizeSensor from 'css-element-queries/src/ResizeSensor';
import ResponsiveTable from './ResponsiveTable';

let table = null;

export default {
  inserted: (el, binding, {
    context,
  }) => {
    table = new ResponsiveTable(el, context);
    return new ResizeSensor(el, () => table.resize());
  },
};
