
//Backend Logic

// Create Model 
// Construct Sp 
// Create Controller 
// Create Repo then 
// Create service 





using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Disbursements.Library.Models.PCF
{
    public class GlAccsListModel
    {
        public int AcctCode { get; set; }

        public string AcctName { get; set; }
    }
}



//Repository 
public IEnumerable<GlAccsListModel> GetGlList()
{
    return repo.GetGlList();
}
//Service 

public IEnumerable<GlAccsListModel> GetGlList()
        {
            using (IDbConnection cn = new SqlConnection(work_disb.ConnectionString()))
                return cn.Query<GlAccsListModel>("sp_glAccs", new
                {
                    Mode = "gl_typeahead",
                }, commandType: CommandType.StoredProcedure, commandTimeout: 0);
        }