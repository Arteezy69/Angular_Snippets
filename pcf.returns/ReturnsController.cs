using System;
using System.Collections.Generic;
using System.Web.Http;
using AppUnify.Library.Services.PCF.Returns;
using AppUnify.Library.Models.PCF.Returns;


namespace AppUnify.Api.Controllers.PCF.Returns
{

    [Authorize, RoutePrefix("api/returns")]
    public class ReturnsController : ApiController
    {
        private ReturnsService service;
        Helper _helper;

        public ReturnsController()
        {
            this._helper = new Helper();
            this.service = new ReturnsService(_helper.GetEmpCode());
        }



        [HttpGet]
        [Route("getReturns")]
        public IHttpActionResult Getreturns(DateTime SDate, DateTime EDate, string BrCode, string CashoutId)
        {
            try
            {
                var output = service.GetReturns(SDate, EDate, BrCode,CashoutId);
                return Ok(output);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.GetBaseException().Message);
            }
        }
        [HttpGet]
        [Route("getReturnsDetails")]
        public IHttpActionResult GetReturnsDetails(DateTime SDate, DateTime EDate, string BrCode,int CashoutId)
        {
            try
            {
                var output = service.GetReturnsDetails(SDate, EDate, BrCode, CashoutId);
                return Ok(output);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.GetBaseException().Message);
            }
        }


        [HttpGet]
        [Route("getReports")]
        public IHttpActionResult GetReports(DateTime SDate, DateTime EDate, string BrCode)
        {
            try
            {
                var output = service.GetReports(SDate, EDate, BrCode);
                return Ok(output);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.GetBaseException().Message);
            }
        }
        [HttpPost]
        [Route("returnAmt")]
        public IHttpActionResult ReturnAmt(IEnumerable<ReturnsModel> model)
        {
            try
            {
                service.ReturnAmt(model);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.GetBaseException().Message);
            }
        }
        [HttpPost]
        [Route("export")]
        public IHttpActionResult Export(IEnumerable<ReturnsModel> model)
        {
            try
            {

                return Ok(service.Export(model));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.GetBaseException().Message);
            }
        }
        [HttpPost]
        [Route("exportReports")]
        public IHttpActionResult ExportReports(IEnumerable<ReturnsModel> model)
        {
            try
            {

                return Ok(service.ExportReports(model));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.GetBaseException().Message);
            }
        }

    }
}