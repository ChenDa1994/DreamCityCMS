<template>
    <div>
        <el-table align="center" ref="multipleTable" :data="dataList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column prop="name" label="广告名" width="120">
            </el-table-column>
            <el-table-column prop="type" label="类型" width="80">
                <template slot-scope="scope">
                    <span v-if="scope.row.type == '0'">文字</span>
                    <span v-if="scope.row.type == '1'">图片</span>
                </template>
            </el-table-column>
            <el-table-column prop="state" label="显示" width="100" show-overflow-tooltip>
                <template slot-scope="scope">
                    <i :class="scope.row.state ? 'fa fa-check-circle' : 'fa fa-minus-circle'" :style="scope.row.state ? green : red"></i>
                </template>
            </el-table-column>
            <el-table-column prop="comments" label="获取代码" width="280" show-overflow-tooltip>
                <template slot-scope="scope">
                    <span>{{'&lt;BooksPannel id=&quot;'+scope.row._id+'&quot; /&gt;'}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="comments" label="广告描述" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" plain round @click="editBooksInfo(scope.$index, dataList)"><i class="fa fa-edit"></i></el-button>
                    <el-button size="mini" type="danger" plain round icon="el-icon-delete" @click="deleteBooks(scope.$index, dataList)"></el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import services from '../../store/services.js';
export default {
    props: {
        dataList: Array
    },
    data() {
        return {
            green: { color: '#13CE66' },
            red: { color: '#FF4949' }
        }
    },

    methods: {
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        editBooksInfo(index, rows) {
            let rowData = rows[index];
            this.$store.dispatch('booksInfoForm', {
                edit: true,
                formData: rowData
            });
            this.$router.push('/editBooks/' + rowData._id);
        },
        deleteBooks(index, rows) {
            this.$confirm('此操作将永久删除该广告, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                return services.delBooks({
                    ids: rows[index]._id
                });
            }).then((result) => {
                if (result.data.state === 'success') {
                    this.$store.dispatch('getBooksList');
                    this.$message({
                        message: '删除成功',
                        type: 'success'
                    });
                } else {
                    this.$message.error(result.data.message);
                }
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        }
    }
}
</script>