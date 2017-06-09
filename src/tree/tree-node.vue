<template> 
  <tr
    v-show="node.visible&&node.fatheExpanded"
    :class="{
      'is-expanded': childNodeRendered && expanded,
      'is-current': tree.store.currentNode === node,
      'is-hidden': !node.visible,
      'is-checked': node.checked
      }"
    class="el-tree-node__content"
    @click.stop="handleClick"
    > 
      <td :style="{ 'padding-left': (node.level - 1) * tree.indent + 'px' }">
        <span
          class="el-tree-node__expand-icon"
          @click.stop="handleExpandIconClick"
          :class="{ 'is-leaf': node.isLeaf, expanded: !node.isLeaf && expanded }">
        </span>
        <el-checkbox
          v-if="showCheckbox"
          v-model="node.checked"
          :indeterminate="node.indeterminate"
          @change="handleCheckChange"
          @click.native.stop="handleUserClick">
        </el-checkbox>
        <span
          v-if="node.loading"
          class="el-tree-node__loading-icon el-icon-loading">
        </span>
      
        <span>{{node.data[columns[0].name]}}</span>
      </td>
      <template v-for="col in columns.slice(1)">
        <node-content :node="node"  :col="col"></node-content>
      </template>
  </tr>
</template>

<script type="text/jsx">
  import emitter from './model/mixins/emitter';

  let isMousedown = false

  export default {
    name: 'ElTreeNode',

    componentName: 'ElTreeNode',

    mixins: [emitter],

    props: {
      columns: {
        type: Array
      },
      node: {
        default() {
          return {};
        }
      },
      props: {},
      renderContent: Function
    },

    components: {
      NodeContent: {
        props: {
          node: {
            required: true
          },
          col: Object
        },
        render(h) {
          const node = this.node;
          const data = node.data;
          const store = node.store;
          return (
            this.col.renderContent? this.col.renderContent(h,{node,data,store})
              : <td>{this.node.data[this.col.name]}</td>
          );
        }
      }
    },

    data() {
      return {
        tree: null,
        expanded: false,
        childNodeRendered: false,
        showCheckbox: false,
        oldChecked: null,
        oldIndeterminate: null
      };
    },

    watch: {
      'node.indeterminate'(val) {
        this.handleSelectChange(this.node.checked, val);
      },

      'node.checked'(val) {
        this.handleSelectChange(val, this.node.indeterminate);
      },

      'node.expanded'(val) {
        this.expanded = val;
        if (val) {
          this.childNodeRendered = true;
        }
      }
    },

    methods: {
      getNodeKey(node, index) {
        const nodeKey = this.tree.nodeKey;
        if (nodeKey && node) {
          return node.data[nodeKey];
        }
        return index;
      },

      handleSelectChange(checked, indeterminate) {
        if (this.oldChecked !== checked && this.oldIndeterminate !== indeterminate) {
          this.tree.$emit('check-change', this.node.data, checked, indeterminate);
        }
        this.oldChecked = checked;
        this.indeterminate = indeterminate;
      },

      handleClick() {
        const store = this.tree.store;
        store.setCurrentNode(this.node);
        this.tree.$emit('current-change', store.currentNode ? store.currentNode.data : null, store.currentNode);
        this.tree.currentNode = this;
        if (this.tree.expandOnClickNode) {
          this.handleExpandIconClick();
        }
        this.tree.$emit('node-click', this.node.data, this.node, this);
      },

      handleExpandIconClick() {
        if (this.node.isLeaf) return;
        if (this.expanded) {
          this.tree.$emit('node-collapse', this.node.data, this.node, this);
          this.node.collapse();
        } else {
          this.node.expand();
          this.$emit('node-expand', this.node.data, this.node, this);
        }
      },

      handleUserClick() {
        if (this.node.indeterminate) {
          this.node.setChecked(this.node.checked, !this.tree.checkStrictly);
        }
      },

      handleCheckChange(ev) {
        if (!this.node.indeterminate) {
          this.node.setChecked(ev.target.checked, !this.tree.checkStrictly);
        }
      },

      handleChildNodeExpand(nodeData, node, instance) {
        this.broadcast('ElTreeNode', 'tree-node-expand', node);
        this.tree.$emit('node-expand', nodeData, node, instance);
      }
    },

    created() {
      const parent = this.$parent;

      if (parent.isTree) {
        this.tree = parent;
      } else {
        this.tree = parent.tree;
      }

      const tree = this.tree;
      if (!tree) {
        console.warn('Can not find node\'s tree.');
      }

      const props = tree.props || {};
      const childrenKey = props['children'] || 'children';

      this.$watch(`node.data.${childrenKey}`, () => {
        this.node.updateChildren();
      });

      this.showCheckbox = tree.showCheckbox;

      if (this.node.expanded) {
        this.expanded = true;
        this.childNodeRendered = true;
      }

      if(this.tree.accordion) {
        this.$on('tree-node-expand', node => {
          if(this.node !== node) {
            this.node.collapse();
          }
        });
      }
    }
  };
</script>
<style scoped>
  .el-tree-node__content.is-checked{
    background: rgb(228, 233, 241);
  }
  span{
    margin: 0 5px
  }
  .el-tree-node__expand-icon{
    margin-left: 10px
  }
</style>