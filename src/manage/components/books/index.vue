<template>
    <div class="adminUser">
        <el-row class="dr-datatable">
            <el-col :span="24">
                <TopBar type="books"></TopBar>
                <DataTable :dataList="booksList.docs"></DataTable>
                <Pagination :pageInfo="booksList.pageInfo" pageType="books"></Pagination>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import InfoForm from './infoForm'
import DataTable from './dataTable.vue';
import TopBar from '../common/TopBar.vue';
import Pagination from '../common/Pagination.vue';
import {
    mapGetters,
    mapActions
} from 'vuex'

export default {
    name: 'index',
    data() {
        return {

        }
    },
    components: {
        DataTable,
        TopBar,
        InfoForm,
        Pagination
    },
    methods: mapActions([

    ]),
    computed: {
        ...mapGetters([
            'booksList'
        ]),
        formState() {
            return this.$store.getters.booksInfoForm
        }
    },
    mounted() {
        this.$store.dispatch('getBooksList');
    }
}
</script>

<style lang="">

</style>